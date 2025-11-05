'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Navigation } from '@/components/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { PackagePlus, ShoppingBag, Pencil, Trash } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function AdminProductosPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/');
      toast.error('Acceso denegado');
      return;
    }

    if (user?.role === 'admin') fetchProducts();
  }, [user, authLoading]);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (res.ok) {
        setProducts(data.products);
      } else {
        toast.error(data.error || 'Error al obtener productos');
      }
    } catch {
      toast.error('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar este producto?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Producto eliminado');
        fetchProducts();
      } else {
        toast.error('Error al eliminar producto');
      }
    } catch {
      toast.error('Error en el servidor');
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
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-3">
            <ShoppingBag className="h-8 w-8 text-amber-700" />
            <h1 className="text-4xl font-bold text-amber-900">Gestión de Productos</h1>
          </div>
          <Button
            onClick={() => router.push('/admin/productos/new')}
            className="bg-amber-600 hover:bg-amber-700 px-6 py-2"
          >
            <PackagePlus className="h-4 w-4 mr-2" />
            Nuevo Producto
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-amber-900">
              Lista de Productos ({products.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <p className="text-center text-amber-600 py-8">No hay productos registrados.</p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((p) => (
                  <div key={p.id} className="border border-amber-200 rounded-lg overflow-hidden shadow-sm bg-white">
                    <div className="relative h-40 w-full bg-amber-100">
                      <Image
                        src={p.image_url}
                        alt={p.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-amber-900">{p.name}</h3>
                      <p className="text-sm text-amber-700 mb-2 line-clamp-2">{p.description}</p>
                      <p className="font-medium text-amber-800 mb-3">${p.price}</p>

                      <div className="flex justify-between items-center">
                        <Link
                          href={`/admin/productos/edit/${p.id}`}
                          className="flex items-center gap-1 text-amber-600 hover:underline"
                        >
                          <Pencil className="h-4 w-4" /> Editar
                        </Link>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="flex items-center gap-1 text-red-600 hover:underline"
                        >
                          <Trash className="h-4 w-4" /> Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
