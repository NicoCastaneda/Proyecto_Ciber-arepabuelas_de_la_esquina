import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { sanitizeInput, validateEmail } from '@/lib/security';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION = 15 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    const sanitizedEmail = sanitizeInput(email).toLowerCase();

    if (!validateEmail(sanitizedEmail)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', sanitizedEmail)
      .maybeSingle();

    if (!user || userError) {
      await supabase.from('security_logs').insert({
        event_type: 'failed_login_attempt',
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        details: { email: sanitizedEmail, reason: 'user_not_found' }
      });

      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    if (user.status === 'blocked') {
      return NextResponse.json(
        { error: 'Cuenta bloqueada. Contacta al administrador.' },
        { status: 403 }
      );
    }

    if (user.status === 'pending') {
      return NextResponse.json(
        { error: 'Tu cuenta está pendiente de aprobación por un administrador.' },
        { status: 403 }
      );
    }

    if (user.failed_login_attempts >= MAX_FAILED_ATTEMPTS && user.last_failed_login) {
      const timeSinceLastFail = Date.now() - new Date(user.last_failed_login).getTime();
      if (timeSinceLastFail < LOCK_DURATION) {
        return NextResponse.json(
          { error: 'Cuenta temporalmente bloqueada. Intenta en 15 minutos.' },
          { status: 429 }
        );
      } else {
        await supabase
          .from('users')
          .update({ failed_login_attempts: 0, last_failed_login: null })
          .eq('id', user.id);
      }
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      const newFailedAttempts = (user.failed_login_attempts || 0) + 1;

      await supabase
        .from('users')
        .update({
          failed_login_attempts: newFailedAttempts,
          last_failed_login: new Date().toISOString()
        })
        .eq('id', user.id);

      await supabase.from('security_logs').insert({
        event_type: 'failed_login_attempt',
        user_id: user.id,
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        details: { email: sanitizedEmail, reason: 'invalid_password', attempts: newFailedAttempts }
      });

      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    await supabase
      .from('users')
      .update({
        failed_login_attempts: 0,
        last_failed_login: null
      })
      .eq('id', user.id);

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-this');
    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      role: user.role
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(secret);

    await supabase.from('security_logs').insert({
      event_type: 'successful_login',
      user_id: user.id,
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      details: { email: sanitizedEmail }
    });

    const response = NextResponse.json({
      message: 'Inicio de sesión exitoso',
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        photo_url: user.photo_url,
        role: user.role,
        status: user.status
      }
    });

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24,
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Error en el servidor' },
      { status: 500 }
    );
  }
}
