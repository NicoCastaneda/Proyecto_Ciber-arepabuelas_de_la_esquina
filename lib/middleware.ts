import { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function verifyAuth(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return { authorized: false, error: 'No token provided' };
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-this');
    const { payload } = await jwtVerify(token, secret);

    const { data: user } = await supabase
      .from('users')
      .select('id, email, role, status')
      .eq('id', payload.userId as string)
      .maybeSingle();

    if (!user || user.status !== 'active') {
      return { authorized: false, error: 'Invalid user' };
    }

    return {
      authorized: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    };
  } catch (error) {
    return { authorized: false, error: 'Invalid token' };
  }
}

export async function requireAuth(request: NextRequest) {
  const auth = await verifyAuth(request);
  if (!auth.authorized) {
    throw new Error('Unauthorized');
  }
  return auth.user!;
}

export async function requireAdmin(request: NextRequest) {
  const user = await requireAuth(request);
  if (user.role !== 'admin') {
    throw new Error('Admin access required');
  }
  return user;
}
