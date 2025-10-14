import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '@/lib/middleware';
import { validateCardNumber, validateCVV, validateExpiryDate, maskCardNumber } from '@/lib/security';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        id,
        total_amount,
        discount_amount,
        final_amount,
        payment_status,
        created_at,
        order_items (
          quantity,
          price_at_purchase,
          subtotal,
          products (
            name,
            image_url
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Error al obtener órdenes' },
        { status: 500 }
      );
    }

    return NextResponse.json({ orders });

  } catch (error) {
    return NextResponse.json(
      { error: 'No autorizado' },
      { status: 403 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const { items, couponCode, paymentInfo } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'El carrito está vacío' },
        { status: 400 }
      );
    }

    if (!paymentInfo || !paymentInfo.cardNumber || !paymentInfo.cvv || !paymentInfo.expiry) {
      return NextResponse.json(
        { error: 'Información de pago incompleta' },
        { status: 400 }
      );
    }

    if (!validateCardNumber(paymentInfo.cardNumber)) {
      return NextResponse.json(
        { error: 'Número de tarjeta inválido' },
        { status: 400 }
      );
    }

    if (!validateCVV(paymentInfo.cvv)) {
      return NextResponse.json(
        { error: 'CVV inválido' },
        { status: 400 }
      );
    }

    if (!validateExpiryDate(paymentInfo.expiry)) {
      return NextResponse.json(
        { error: 'Fecha de expiración inválida' },
        { status: 400 }
      );
    }

    const productIds = items.map((item: any) => item.productId);
    const { data: products } = await supabase
      .from('products')
      .select('*')
      .in('id', productIds);

    if (!products || products.length !== items.length) {
      return NextResponse.json(
        { error: 'Productos no encontrados' },
        { status: 404 }
      );
    }

    let totalAmount = 0;
    const orderItems = items.map((item: any) => {
      const product = products.find(p => p.id === item.productId);
      if (!product) throw new Error('Product not found');

      const subtotal = product.price * item.quantity;
      totalAmount += subtotal;

      return {
        product_id: product.id,
        quantity: item.quantity,
        price_at_purchase: product.price,
        subtotal
      };
    });

    let discountAmount = 0;
    let couponId = null;

    if (couponCode) {
      const { data: coupon } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode)
        .eq('user_id', user.id)
        .eq('used', false)
        .maybeSingle();

      if (coupon && new Date(coupon.expires_at) > new Date()) {
        discountAmount = totalAmount * (coupon.discount_percentage / 100);
        couponId = coupon.id;

        await supabase
          .from('coupons')
          .update({ used: true, used_at: new Date().toISOString() })
          .eq('id', coupon.id);
      }
    }

    const finalAmount = totalAmount - discountAmount;

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        total_amount: totalAmount,
        discount_amount: discountAmount,
        final_amount: finalAmount,
        coupon_id: couponId,
        payment_method: 'card',
        payment_status: 'completed'
      })
      .select()
      .single();

    if (orderError) {
      return NextResponse.json(
        { error: 'Error al crear orden' },
        { status: 500 }
      );
    }

    const itemsWithOrderId = orderItems.map((item: any) => ({
      ...item,
      order_id: order.id
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(itemsWithOrderId);

    if (itemsError) {
      await supabase.from('orders').delete().eq('id', order.id);
      return NextResponse.json(
        { error: 'Error al crear items de orden' },
        { status: 500 }
      );
    }

    await supabase.from('security_logs').insert({
      event_type: 'order_created',
      user_id: user.id,
      details: {
        order_id: order.id,
        amount: finalAmount,
        masked_card: maskCardNumber(paymentInfo.cardNumber)
      }
    });

    return NextResponse.json({
      message: 'Orden creada exitosamente',
      order: {
        id: order.id,
        total_amount: totalAmount,
        discount_amount: discountAmount,
        final_amount: finalAmount,
        created_at: order.created_at
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Error al procesar la orden' },
      { status: 500 }
    );
  }
}
