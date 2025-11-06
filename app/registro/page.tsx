'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import Link from 'next/link';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    photo: null as File | null,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && !file.type.startsWith('image/')) {
      toast.error('El archivo debe ser una imagen válida');
      return;
    }
    setFormData({ ...formData, photo: file });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    const form = new FormData();
    form.append('fullName', formData.fullName);
    form.append('email', formData.email);
    form.append('password', formData.password);
    if (formData.photo) form.append('photo', formData.photo);

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', { method: 'POST', body: form });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Error al registrar');
      toast.success('¡Registro exitoso! Tu cuenta está pendiente de aprobación.');
      router.push('/login');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
      <Navigation />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card className="border-amber-200 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl text-amber-900">Crear Cuenta</CardTitle>
              <CardDescription>Regístrate para disfrutar de nuestros productos</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="fullName">Nombre Completo</Label>
                  <Input id="fullName" required value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input id="email" type="email" required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input id="password" type="password" required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                  <Input id="confirmPassword" type="password" required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="photo">Foto de Perfil</Label>
                  <Input id="photo" type="file" accept="image/*" onChange={handleFileChange} />
                  <p className="text-xs text-amber-600">Solo se aceptan imágenes JPG o PNG.</p>
                </div>

                <Button type="submit" disabled={loading} className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                  {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
                </Button>

                <div className="text-center text-sm text-amber-700">
                  ¿Ya tienes cuenta?{' '}
                  <Link href="/login" className="font-semibold text-amber-800 hover:text-amber-900 underline">
                    Inicia sesión aquí
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
