'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Navigation } from '@/components/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ShoppingBag, Shield, Clock, Award } from 'lucide-react';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/productos');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
      <Navigation />

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-amber-700 via-yellow-600 to-orange-600 bg-clip-text text-transparent">
              Arepabuelas de la Esquina
            </h1>
            <p className="text-xl md:text-2xl text-amber-800">
              Tradición y sabor artesanal en cada bocado
            </p>
            <p className="text-lg text-amber-700 max-w-2xl mx-auto">
              Descubre nuestras arepas hechas con amor, siguiendo recetas tradicionales
              transmitidas de generación en generación.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/registro">
              <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-6 text-lg">
                <ShoppingBag className="mr-2 h-5 w-5" />
                Comenzar a Comprar
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="border-amber-600 text-amber-700 hover:bg-amber-50 px-8 py-6 text-lg">
                Iniciar Sesión
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8 pt-16">
            <div className="bg-white/80 backdrop-blur rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-amber-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-6 w-6 text-amber-700" />
              </div>
              <h3 className="text-xl font-semibold text-amber-900 mb-2">Calidad Premium</h3>
              <p className="text-amber-700">
                Ingredientes seleccionados y preparación artesanal para garantizar el mejor sabor
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-amber-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-6 w-6 text-amber-700" />
              </div>
              <h3 className="text-xl font-semibold text-amber-900 mb-2">Entrega Rápida</h3>
              <p className="text-amber-700">
                Procesos eficientes para que disfrutes de nuestros productos frescos
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-amber-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-amber-700" />
              </div>
              <h3 className="text-xl font-semibold text-amber-900 mb-2">Compra Segura</h3>
              <p className="text-amber-700">
                Tus datos y transacciones están protegidos con la mejor tecnología
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-amber-100 to-yellow-100 rounded-lg p-8 mt-16">
            <h2 className="text-2xl font-bold text-amber-900 mb-3">
              ¡Cupón de Bienvenida!
            </h2>
            <p className="text-amber-800 text-lg">
              Regístrate ahora y recibe un <span className="font-bold">15% de descuento</span> en tu primera compra
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
