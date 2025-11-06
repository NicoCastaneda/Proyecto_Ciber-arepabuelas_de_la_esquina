import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin, verifyAuth } from '@/lib/middleware';
import { sanitizeInput } from '@/lib/security';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function isValidPexelsUrl(url: string): boolean {
  const regex = /^https:\/\/images\.pexels\.com\/photos\/\d+\/pexels-photo-\d+\.jpeg/;
  return regex.test(url);
}

export async function GET(
  request: NextRequest,
  //{ params }: { params: { id: string } }
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const auth = await verifyAuth(request);
    if (!auth.authorized) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ product });

  } catch (error) {
    return NextResponse.json(
      { error: 'Error en el servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  //{ params }: { params: { id: string } }
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    await requireAdmin(request);
    const body = await request.json();
    const { name, description, price, image_url, stock } = body;

    const updates: any = { updated_at: new Date().toISOString() };

    if (name) updates.name = sanitizeInput(name);
    if (description) updates.description = sanitizeInput(description);
    if (price) updates.price = parseFloat(price);
    if (image_url) {
      if (!isValidPexelsUrl(image_url)) {
        return NextResponse.json(
          { error: 'La URL de la imagen debe ser de Pexels (https://images.pexels.com/...)' },
          { status: 400 }
        );
      }
      updates.image_url = image_url;
    }

    if (stock !== undefined) updates.stock = parseInt(stock);

    const { data: product, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Error al actualizar producto' },
        { status: 500 }
      );
    }

    return NextResponse.json({ product });

  } catch (error) {
    return NextResponse.json(
      { error: 'No autorizado' },
      { status: 403 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    await requireAdmin(request);

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json(
        { error: 'Error al eliminar producto' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Producto eliminado exitosamente' });

  } catch (error) {
    return NextResponse.json(
      { error: 'No autorizado' },
      { status: 403 }
    );
  }
}
