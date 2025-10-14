import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '@/lib/middleware';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    const { data: coupons, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('user_id', user.id)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString());

    if (error) {
      return NextResponse.json(
        { error: 'Error al obtener cupones' },
        { status: 500 }
      );
    }

    return NextResponse.json({ coupons });

  } catch (error) {
    return NextResponse.json(
      { error: 'No autorizado' },
      { status: 403 }
    );
  }
}
