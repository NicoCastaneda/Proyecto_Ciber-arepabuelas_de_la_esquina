import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin, verifyAuth } from '@/lib/middleware';
import { sanitizeInput } from '@/lib/security';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ✅ Validar URLs válidas de Pexels
function isValidPexelsUrl(url: string) {
  return /^https:\/\/images\.pexels\.com\/photos\/\d+\/pexels-photo-\d+\.jpeg/.test(url);
}

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Error al obtener productos' }, { status: 500 });
    }

    return NextResponse.json({ products });
  } catch {
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    const body = await request.json();
    console.log('BODY RECIBIDO:', body);

    const { name, description, price, image_url, imageUrl, stock } = body;
    const finalImageUrl = image_url || imageUrl;

    // ✅ Validación básica
    if (!name?.trim() || !description?.trim() || !price || !finalImageUrl?.trim()) {
      console.log({ name, description, price, finalImageUrl, stock });
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    // ✅ Validación de formato de URL
    if (!isValidPexelsUrl(finalImageUrl)) {
      return NextResponse.json(
        { error: 'La URL de la imagen debe ser de Pexels (https://images.pexels.com/...)' },
        { status: 400 }
      );
    }

    if (parseFloat(price) <= 0) {
      return NextResponse.json(
        { error: 'El precio debe ser mayor a 0' },
        { status: 400 }
      );
    }

    const sanitizedName = sanitizeInput(name);
    const sanitizedDescription = sanitizeInput(description);

    const { data: product, error } = await supabase
      .from('products')
      .insert({
        name: sanitizedName,
        description: sanitizedDescription,
        price: parseFloat(price),
        image_url: finalImageUrl, // 👈 CORREGIDO
        stock: parseInt(stock) || 0,
        created_by: admin.id,
      })
      .select()
      .single();

    if (error) {
      console.error('SUPABASE ERROR:', error);
      return NextResponse.json({ error: 'Error al crear producto' }, { status: 500 });
    }

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error('POST ERROR:', error);
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }
}
