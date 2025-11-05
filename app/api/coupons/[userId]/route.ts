import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  const { userId } = await context.params;

  const { data: coupon, error } = await supabase
    .from('coupons')
    .select('code, discount_percentage, expires_at, used_at')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !coupon) {
    return NextResponse.json({ coupon: null });
  }

  const now = new Date();
  const expired = new Date(coupon.expires_at) < now;
  const used = !!coupon.used_at;

  return NextResponse.json({
    coupon: {
      ...coupon,
      status: used ? 'usado' : expired ? 'vencido' : 'válido'
    }
  });
}
