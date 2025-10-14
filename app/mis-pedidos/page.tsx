'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Navigation } from '@/components/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag } from 'lucide-react';

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchOrders();
    }
  }, [user, authLoading, router]);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders);
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-amber-900 mb-8">Mis Pedidos</h1>

        {orders.length === 0 ? (
          <Card className="text-center py-16">
            <ShoppingBag className="h-16 w-16 mx-auto text-amber-300 mb-4" />
            <p className="text-amber-700 text-lg">No tienes pedidos aún</p>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-amber-900">Pedido #{order.id.slice(0, 8)}</CardTitle>
                      <p className="text-sm text-amber-600">
                        {new Date(order.created_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <Badge className="bg-green-600">Completado</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {order.order_items?.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-center border-b border-amber-100 pb-2">
                        <div>
                          <p className="font-medium text-amber-900">{item.products?.name}</p>
                          <p className="text-sm text-amber-600">
                            Cantidad: {item.quantity} × ${(item.price_at_purchase / 100).toFixed(2)}
                          </p>
                        </div>
                        <p className="font-semibold text-amber-900">
                          ${(item.subtotal / 100).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-amber-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-amber-900">Total Pagado:</span>
                      <span className="text-2xl font-bold text-amber-900">
                        ${(order.final_amount / 100).toFixed(2)}
                      </span>
                    </div>
                    {order.discount_amount > 0 && (
                      <p className="text-sm text-green-600 mt-1">
                        Ahorraste ${(order.discount_amount / 100).toFixed(2)} con cupón
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
