import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAuth, verifyAuth } from '@/lib/middleware';
import { sanitizeInput } from '@/lib/security';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authorized) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { data: comments, error } = await supabase
      .from('product_comments')
      .select(`
        id,
        comment_text,
        rating,
        created_at,
        users:user_id (
          full_name,
          photo_url
        )
      `)
      .eq('product_id', params.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Error al obtener comentarios' },
        { status: 500 }
      );
    }

    return NextResponse.json({ comments });

  } catch (error) {
    return NextResponse.json(
      { error: 'Error en el servidor' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const { commentText, rating } = body;

    if (!commentText || !rating) {
      return NextResponse.json(
        { error: 'Comentario y calificación son requeridos' },
        { status: 400 }
      );
    }

    const sanitizedComment = sanitizeInput(commentText);

    if (sanitizedComment.length < 5) {
      return NextResponse.json(
        { error: 'El comentario debe tener al menos 5 caracteres' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'La calificación debe estar entre 1 y 5' },
        { status: 400 }
      );
    }

    const { data: comment, error } = await supabase
      .from('product_comments')
      .insert({
        product_id: params.id,
        user_id: user.id,
        comment_text: sanitizedComment,
        rating: parseInt(rating)
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Error al crear comentario' },
        { status: 500 }
      );
    }

    return NextResponse.json({ comment }, { status: 201 });

  } catch (error) {
    return NextResponse.json(
      { error: 'No autorizado' },
      { status: 403 }
    );
  }
}
