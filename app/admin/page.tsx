'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Navigation } from '@/components/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Shield } from 'lucide-react';

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/');
      toast.error('Acceso denegado');
      return;
    }

    if (user?.role === 'admin') {
      fetchUsers();
    }
  }, [user, authLoading, router]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/approve`, {
        method: 'POST'
      });

      if (response.ok) {
        toast.success('Usuario aprobado');
        fetchUsers();
      } else {
        toast.error('Error al aprobar usuario');
      }
    } catch (error) {
      toast.error('Error en el servidor');
    }
  };

  const handleBlock = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/block`, {
        method: 'POST'
      });

      if (response.ok) {
        toast.success('Usuario bloqueado');
        fetchUsers();
      } else {
        toast.error('Error al bloquear usuario');
      }
    } catch (error) {
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

  const pendingUsers = users.filter(u => u.status === 'pending');
  const activeUsers = users.filter(u => u.status === 'active');
  const blockedUsers = users.filter(u => u.status === 'blocked');

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-8 w-8 text-amber-700" />
          <h1 className="text-4xl font-bold text-amber-900">Panel de Administración</h1>
        </div>

        <div className="space-y-8">
          {pendingUsers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-amber-900">
                  Usuarios Pendientes de Aprobación ({pendingUsers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-amber-900">{user.full_name}</p>
                        <p className="text-sm text-amber-600">{user.email}</p>
                        <p className="text-xs text-amber-500">
                          Registrado: {new Date(user.created_at).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleApprove(user.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Aprobar
                        </Button>
                        <Button
                          onClick={() => handleBlock(user.id)}
                          variant="destructive"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Rechazar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-amber-900">
                Usuarios Activos ({activeUsers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 border border-amber-200 rounded">
                    <div className="flex items-center gap-3">
                      <Badge className={user.role === 'admin' ? 'bg-purple-600' : 'bg-blue-600'}>
                        {user.role}
                      </Badge>
                      <div>
                        <p className="font-medium text-amber-900">{user.full_name}</p>
                        <p className="text-sm text-amber-600">{user.email}</p>
                      </div>
                    </div>
                    {user.role !== 'admin' && (
                      <Button
                        onClick={() => handleBlock(user.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-600"
                      >
                        Bloquear
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {blockedUsers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-amber-900">
                  Usuarios Bloqueados ({blockedUsers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {blockedUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-red-50 rounded">
                      <div>
                        <p className="font-medium text-gray-700">{user.full_name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <Badge variant="destructive">Bloqueado</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
