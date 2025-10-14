'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import { Navigation } from '@/components/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Trash2, ShoppingBag } from 'lucide-react';
import Image from 'next/image';

export default function CartPage() {
  const { user } = useAuth();
  const { items, removeFromCart, updateQuantity, clearCart, total } = useCart();
  const router = useRouter();
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expiry: '',
    cvv: ''
  });
  const [processing, setProcessing] = useState(false);

  const handleApplyCoupon = async () => {
    try {
      const response = await fetch('/api/coupons');
      const data = await response.json();
      const validCoupon = data.coupons.find((c: any) => c.code === couponCode);

      if (validCoupon) {
        setDiscount(validCoupon.discount_percentage);
        toast.success(`Cupón aplicado: ${validCoupon.discount_percentage}% de descuento`);
      } else {
        toast.error('Cupón inválido o expirado');
      }
    } catch (error) {
      toast.error('Error al validar cupón');
    }
  };

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error('El carrito está vacío');
      return;
    }

    if (!paymentInfo.cardNumber || !paymentInfo.expiry || !paymentInfo.cvv) {
      toast.error('Complete la información de pago');
      return;
    }

    setProcessing(true);

    try {
      const orderItems = items.map(item => ({
        productId: item.product.id,
        quantity: item.quantity
      }));

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: orderItems,
          couponCode: discount > 0 ? couponCode : null,
          paymentInfo
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('¡Compra realizada exitosamente!');
        clearCart();
        router.push('/mis-pedidos');
      } else {
        toast.error(data.error || 'Error al procesar la orden');
      }
    } catch (error) {
      toast.error('Error en el servidor');
    } finally {
      setProcessing(false);
    }
  };

  const discountAmount = (total * discount) / 100;
  const finalTotal = total - discountAmount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-amber-900 mb-8">Carrito de Compras</h1>

        {items.length === 0 ? (
          <Card className="text-center py-16">
            <ShoppingBag className="h-16 w-16 mx-auto text-amber-300 mb-4" />
            <p className="text-amber-700 text-lg mb-4">Tu carrito está vacío</p>
            <Button onClick={() => router.push('/productos')} className="bg-amber-600 hover:bg-amber-700">
              Ver Productos
            </Button>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <Card key={item.product.id}>
                  <CardContent className="flex gap-4 p-4">
                    <div className="relative h-24 w-24 flex-shrink-0 bg-amber-100 rounded">
                      <Image
                        src={item.product.image_url}
                        alt={item.product.name}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-semibold text-amber-900">{item.product.name}</h3>
                      <p className="text-sm text-amber-700">${(item.product.price / 100).toFixed(2)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        >
                          -
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-amber-900">
                        ${((item.product.price * item.quantity) / 100).toFixed(2)}
                      </p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-red-600 hover:text-red-700 mt-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-amber-900">Cupón de Descuento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Código de cupón"
                  />
                  <Button
                    onClick={handleApplyCoupon}
                    variant="outline"
                    className="w-full"
                  >
                    Aplicar Cupón
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-amber-900">Información de Pago</CardTitle>
                  <p className="text-xs text-amber-600">Simulación - No se procesarán pagos reales</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Número de Tarjeta</Label>
                    <Input
                      value={paymentInfo.cardNumber}
                      onChange={(e) => setPaymentInfo({ ...paymentInfo, cardNumber: e.target.value })}
                      placeholder="1234 5678 9012 3456"
                      maxLength={16}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Fecha (MM/AA)</Label>
                      <Input
                        value={paymentInfo.expiry}
                        onChange={(e) => setPaymentInfo({ ...paymentInfo, expiry: e.target.value })}
                        placeholder="12/25"
                      />
                    </div>
                    <div>
                      <Label>CVV</Label>
                      <Input
                        value={paymentInfo.cvv}
                        onChange={(e) => setPaymentInfo({ ...paymentInfo, cvv: e.target.value })}
                        placeholder="123"
                        maxLength={4}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-amber-900">Resumen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-amber-700">Subtotal:</span>
                    <span className="font-semibold">${(total / 100).toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Descuento ({discount}%):</span>
                      <span>-${(discountAmount / 100).toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold text-amber-900">
                    <span>Total:</span>
                    <span>${(finalTotal / 100).toFixed(2)}</span>
                  </div>
                  <Button
                    onClick={handleCheckout}
                    disabled={processing}
                    className="w-full bg-amber-600 hover:bg-amber-700"
                  >
                    {processing ? 'Procesando...' : 'Realizar Compra'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
