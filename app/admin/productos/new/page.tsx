'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ArrowLeft, Package } from 'lucide-react';

export default function NewProductPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    stock: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // ✅ Enviar el campo image_url correctamente
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Producto creado correctamente');
        router.push('/admin/productos');
      } else {
        toast.error(data.error || 'Error al crear producto');
      }
    } catch {
      toast.error('Error en el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Volver
          </Button>
          <h1 className="text-3xl font-bold text-amber-900 flex items-center gap-2">
            <Package className="h-6 w-6 text-amber-700" />
            Nuevo Producto
          </h1>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-amber-900">Registrar Producto</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-amber-800 mb-1">Nombre</label>
                  <Input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-amber-800 mb-1">Descripción</label>
                  <Textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-amber-800 mb-1">Precio ($)</label>
                    <Input
                      name="price"
                      type="number"
                      value={form.price}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-amber-800 mb-1">Stock</label>
                    <Input
                      name="stock"
                      type="number"
                      value={form.stock}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-amber-800 mb-1">
                    URL de imagen (solo de Pexels)
                  </label>
                  <Input
                    name="image_url"
                    type="url"
                    value={form.image_url}
                    onChange={handleChange}
                    required
                    pattern="^https://images\.pexels\.com/.*"
                    placeholder="Pega aquí la URL de una imagen de Pexels"
                  />
                  <p className="text-xs text-amber-600 mt-1">
                    🔗 Abre{' '}
                    <a
                      href="https://www.pexels.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      Pexels
                    </a>{' '}
                    para copiar una imagen.
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-amber-600 hover:bg-amber-700"
                  disabled={loading}
                >
                  {loading ? 'Creando...' : 'Crear Producto'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
