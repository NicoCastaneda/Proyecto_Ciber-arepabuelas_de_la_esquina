import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST() {
  try {
    const adminPassword = await bcrypt.hash('admin123', 10);
    const clientPassword = await bcrypt.hash('prueba123', 10);

    const { data: existingAdmin } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'admin@arepabuelas.com')
      .maybeSingle();

    let adminId;

    if (!existingAdmin) {
      const { data: admin } = await supabase
        .from('users')
        .insert({
          email: 'admin@arepabuelas.com',
          password_hash: adminPassword,
          full_name: 'Administrador',
          role: 'admin',
          status: 'active'
        })
        .select()
        .single();
      adminId = admin?.id;
    } else {
      adminId = existingAdmin.id;
    }

    const { data: existingClient } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'cliente@arepabuelas.com')
      .maybeSingle();

    let clientId;

    if (!existingClient) {
      const { data: client } = await supabase
        .from('users')
        .insert({
          email: 'cliente@arepabuelas.com',
          password_hash: clientPassword,
          full_name: 'Cliente Demo',
          role: 'customer',
          status: 'active',
          approved_at: new Date().toISOString(),
          approved_by: adminId
        })
        .select()
        .single();
      clientId = client?.id;

      if (clientId) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        await supabase.from('coupons').insert({
          code: 'WELCOME-DEMO123',
          discount_percentage: 15,
          user_id: clientId,
          expires_at: expiresAt.toISOString()
        });
      }
    }

    const { data: existingProducts } = await supabase
      .from('products')
      .select('id')
      .limit(1);

    if (!existingProducts || existingProducts.length === 0) {
      const products = [
        {
          name: 'Arepa de Queso',
          description: 'Deliciosa arepa rellena con queso fresco y mantequilla, perfecta para el desayuno o la cena.',
          price: 3500,
          image_url: 'https://images.pexels.com/photos/6419720/pexels-photo-6419720.jpeg?auto=compress&cs=tinysrgb&w=800',
          stock: 50,
          created_by: adminId
        },
        {
          name: 'Arepa de Carne Mechada',
          description: 'Arepa tradicional con carne desmechada, aguacate y tomate. Un clásico venezolano.',
          price: 5500,
          image_url: 'https://images.pexels.com/photos/4518561/pexels-photo-4518561.jpeg?auto=compress&cs=tinysrgb&w=800',
          stock: 40,
          created_by: adminId
        },
        {
          name: 'Arepa Reina Pepiada',
          description: 'Rellena con ensalada de pollo y aguacate. La favorita de todos.',
          price: 5000,
          image_url: 'https://images.pexels.com/photos/7363676/pexels-photo-7363676.jpeg?auto=compress&cs=tinysrgb&w=800',
          stock: 45,
          created_by: adminId
        },
        {
          name: 'Arepa Dominó',
          description: 'Combinación perfecta de frijoles negros y queso blanco rallado.',
          price: 4500,
          image_url: 'https://images.pexels.com/photos/8477270/pexels-photo-8477270.jpeg?auto=compress&cs=tinysrgb&w=800',
          stock: 35,
          created_by: adminId
        },
        {
          name: 'Arepa Pabellón',
          description: 'La más completa: carne mechada, caraotas negras, plátano frito y queso rallado.',
          price: 6500,
          image_url: 'https://images.pexels.com/photos/5638372/pexels-photo-5638372.jpeg?auto=compress&cs=tinysrgb&w=800',
          stock: 30,
          created_by: adminId
        },
        {
          name: 'Arepa de Pernil',
          description: 'Arepa con pernil de cerdo jugoso, cebolla caramelizada y salsa de la casa.',
          price: 5800,
          image_url: 'https://images.pexels.com/photos/4871119/pexels-photo-4871119.jpeg?auto=compress&cs=tinysrgb&w=800',
          stock: 25,
          created_by: adminId
        }
      ];

      await supabase.from('products').insert(products);
    }

    return NextResponse.json({
      message: 'Base de datos inicializada correctamente',
      credentials: {
        admin: { email: 'admin@arepabuelas.com', password: 'admin123' },
        client: { email: 'cliente@arepabuelas.com', password: 'prueba123' }
      }
    });

  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Error al inicializar la base de datos' },
      { status: 500 }
    );
  }
}
