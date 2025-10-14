'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import { Navigation } from '@/components/navigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Star } from 'lucide-react';
import { Product } from '@/lib/supabase';
import { toast } from 'sonner';
import Image from 'next/image';

export default function ProductsPage() {
  const { user, loading: authLoading } = useAuth();
  const { addToCart } = useCart();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchProducts();
    }
  }, [user, authLoading, router]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products);
      }
    } catch (error) {
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    toast.success(`${product.name} agregado al carrito`);
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-amber-900 mb-2">Nuestros Productos</h1>
          <p className="text-amber-700">Arepas artesanales hechas con amor</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-xl transition-shadow border-amber-200">
              <div className="relative h-48 w-full bg-amber-100">
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl text-amber-900">{product.name}</CardTitle>
                  <Badge className="bg-amber-600">${(product.price / 100).toFixed(2)}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-amber-700 text-sm">{product.description}</p>
                <div className="flex items-center gap-1 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-xs text-amber-600 ml-1">(5.0)</span>
                </div>
                {product.stock > 0 ? (
                  <p className="text-xs text-green-600 mt-2">En stock: {product.stock} disponibles</p>
                ) : (
                  <p className="text-xs text-red-600 mt-2">Agotado</p>
                )}
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stock === 0}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Agregar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/productos/${product.id}`)}
                  className="border-amber-600 text-amber-700 hover:bg-amber-50"
                >
                  Ver Detalle
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-16">
            <p className="text-amber-700 text-lg">No hay productos disponibles</p>
          </div>
        )}
      </main>
    </div>
  );
}
