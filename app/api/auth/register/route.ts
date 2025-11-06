import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { sanitizeInput, validateEmail, validatePassword, generateCouponCode } from '@/lib/security';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const email = formData.get('email')?.toString() || '';
    const password = formData.get('password')?.toString() || '';
    const fullName = formData.get('fullName')?.toString() || '';
    const photoFile = formData.get('photo') as File | null;

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 });
    }

    const sanitizedEmail = sanitizeInput(email).toLowerCase();
    const sanitizedFullName = sanitizeInput(fullName);

    if (!validateEmail(sanitizedEmail)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json({ error: passwordValidation.errors[0] }, { status: 400 });
    }

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', sanitizedEmail)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json({ error: 'El correo ya está registrado' }, { status: 400 });
    }

    // Subir foto a Supabase Storage (si se adjunta)
    let photoUrl: string | null = null;
    if (photoFile) {
      if (!photoFile.type.startsWith('image/')) {
        return NextResponse.json({ error: 'El archivo debe ser una imagen válida' }, { status: 400 });
      }

      const fileName = `profile_${Date.now()}_${Math.random().toString(36).substring(2)}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('user_photos')
        .upload(fileName, photoFile, { contentType: photoFile.type });

      if (uploadError) {
        console.error('Error uploading photo:', uploadError);
        return NextResponse.json({ error: 'Error al subir la foto' }, { status: 500 });
      }

      const { data } = supabase.storage.from('user_photos').getPublicUrl(fileName);
      photoUrl = data.publicUrl;
    }

    // Crear usuario
    const passwordHash = await bcrypt.hash(password, 10);
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        email: sanitizedEmail,
        password_hash: passwordHash,
        full_name: sanitizedFullName,
        photo_url: photoUrl,
        role: 'customer',
        status: 'pending'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating user:', insertError);
      return NextResponse.json({ error: 'Error al crear el usuario' }, { status: 500 });
    }

    const couponCode = generateCouponCode();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await supabase.from('coupons').insert({
      code: couponCode,
      discount_percentage: 15,
      user_id: newUser.id,
      expires_at: expiresAt.toISOString()
    });

    await supabase.from('security_logs').insert({
      event_type: 'user_registration',
      user_id: newUser.id,
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      details: { email: sanitizedEmail }
    });

    return NextResponse.json({
      message: 'Usuario registrado exitosamente. Tu cuenta está pendiente de aprobación.',
      user: {
        id: newUser.id,
        email: newUser.email,
        full_name: newUser.full_name,
        photo_url: newUser.photo_url
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 });
  }
}
