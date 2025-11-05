'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Navigation } from '@/components/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      toast.success('¡Bienvenido de vuelta!');
      router.push('/productos');
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
              <CardTitle className="text-2xl text-amber-900">Iniciar Sesión</CardTitle>
              <CardDescription>Ingresa a tu cuenta de Arepabuelas</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    required
                    className="border-amber-200 focus:border-amber-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="border-amber-200 focus:border-amber-500"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                >
                  {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </Button>

                <div className="text-center text-sm text-amber-700">
                  ¿No tienes cuenta?{' '}
                  <Link href="/registro" className="font-semibold text-amber-800 hover:text-amber-900 underline">
                    Regístrate aquí
                  </Link>
                </div>

                {/* <div className="pt-4 border-t border-amber-200">
                  <p className="text-sm text-amber-700 font-medium mb-2">Credenciales de prueba:</p>
                  <div className="text-xs text-amber-600 space-y-1 bg-amber-50 p-3 rounded">
                    <p><strong>Admin:</strong> admin@arepabuelas.com / admin123</p>
                    <p><strong>Cliente:</strong> cliente@arepabuelas.com / prueba123</p>
                  </div>
                </div> */}
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
