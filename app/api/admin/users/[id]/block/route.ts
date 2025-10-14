import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/lib/middleware';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin(request);

    const { error } = await supabase
      .from('users')
      .update({ status: 'blocked' })
      .eq('id', params.id);

    if (error) {
      return NextResponse.json(
        { error: 'Error al bloquear usuario' },
        { status: 500 }
      );
    }

    await supabase.from('security_logs').insert({
      event_type: 'user_blocked',
      user_id: params.id,
      details: { blocked_by: admin.id }
    });

    return NextResponse.json({ message: 'Usuario bloqueado exitosamente' });

  } catch (error) {
    return NextResponse.json(
      { error: 'No autorizado' },
      { status: 403 }
    );
  }
}
