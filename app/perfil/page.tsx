'use client';

import { useAuth } from '@/lib/auth-context';
import { Navigation } from '@/components/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Calendar, Award } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-amber-900 mb-8">Mi Perfil</h1>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <Avatar className="h-24 w-24 mx-auto mb-4">
                <AvatarImage src={user.photo_url} alt={user.full_name} />
                <AvatarFallback className="bg-amber-200 text-amber-800 text-2xl">
                  {user.full_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-2xl text-amber-900">{user.full_name}</CardTitle>
              <div className="flex justify-center gap-2 mt-2">
                <Badge className={user.role === 'admin' ? 'bg-purple-600' : 'bg-blue-600'}>
                  {user.role === 'admin' ? 'Administrador' : 'Cliente'}
                </Badge>
                <Badge className="bg-green-600">Activo</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-lg">
                <Mail className="h-5 w-5 text-amber-700" />
                <div>
                  <p className="text-sm text-amber-600">Correo Electrónico</p>
                  <p className="font-medium text-amber-900">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-lg">
                <Calendar className="h-5 w-5 text-amber-700" />
                <div>
                  <p className="text-sm text-amber-600">Miembro desde</p>
                  <p className="font-medium text-amber-900">
                    {new Date(user.created_at).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-lg">
                <Award className="h-5 w-5 text-amber-700" />
                <div>
                  <p className="text-sm text-amber-600">Estado de Cuenta</p>
                  <p className="font-medium text-amber-900 capitalize">{user.status}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
