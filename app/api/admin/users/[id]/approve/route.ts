import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/lib/middleware';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // ✅ esperar la promesa antes de usar

  try {
    const admin = await requireAdmin(request);

    const { error } = await supabase
      .from('users')
      .update({
        status: 'active',
        approved_at: new Date().toISOString(),
        approved_by: admin.id
      })
      .eq('id', id);

    if (error) {
      return NextResponse.json(
        { error: 'Error al aprobar usuario' },
        { status: 500 }
      );
    }

    await supabase.from('security_logs').insert({
      event_type: 'user_approved',
      user_id: id,
      details: { approved_by: admin.id }
    });

    return NextResponse.json({ message: 'Usuario aprobado exitosamente' });

  } catch (error) {
    return NextResponse.json(
      { error: 'No autorizado' },
      { status: 403 }
    );
  }
}
