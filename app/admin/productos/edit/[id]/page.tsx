'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Navigation } from '@/components/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';

export default function EditProductPage() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    image_url: '',
  });

  // 🔐 Verificación de admin y carga inicial
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/');
      toast.error('Acceso denegado');
      return;
    }

    if (user?.role === 'admin') fetchProduct();
  }, [user, authLoading]);

  // 🧭 Obtener datos del producto
  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products/${id}`);
      const data = await res.json();
      if (res.ok) {
        setProduct(data.product);
        setForm({
          name: data.product.name,
          description: data.product.description,
          price: data.product.price,
          stock: data.product.stock,
          image_url: data.product.image_url,
        });
      } else {
        toast.error(data.error || 'Error al obtener producto');
      }
    } catch {
      toast.error('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  // ✏️ Manejo de inputs
  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 💾 Guardar cambios
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success('Producto actualizado correctamente');
        router.push('/admin/productos');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Error al actualizar producto');
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

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-amber-700">
        <p>No se encontró el producto.</p>
        <Link href="/admin/productos" className="text-amber-600 underline mt-2">
          Volver a la lista
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
      <Navigation />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Link
          href="/admin/productos"
          className="inline-flex items-center text-amber-700 mb-6 hover:underline"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Volver
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-amber-900 text-2xl">Editar Producto</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                name="name"
                placeholder="Nombre"
                value={form.name}
                onChange={handleChange}
                required
              />
              <Input
                name="description"
                placeholder="Descripción"
                value={form.description}
                onChange={handleChange}
                required
              />
              <Input
                type="number"
                name="price"
                placeholder="Precio"
                value={form.price}
                onChange={handleChange}
                required
              />
              <Input
                type="number"
                name="stock"
                placeholder="Stock"
                value={form.stock}
                onChange={handleChange}
              />
              <div>
                <label className="text-sm text-amber-700 block mb-1">
                  URL de imagen (solo de Pexels)
                </label>
                <div className="flex gap-2">
                  <Input
                    name="image_url"
                    placeholder="https://images.pexels.com/..."
                    value={form.image_url}
                    onChange={handleChange}
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => window.open('https://www.pexels.com', '_blank')}
                    className="text-amber-700 border-amber-300"
                  >
                    Ver Pexels
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-700 flex items-center justify-center"
              >
                <Save className="h-4 w-4 mr-2" /> Guardar Cambios
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
