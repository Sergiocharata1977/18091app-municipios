// API endpoint for creating admin user records

import { getAdminFirestore } from '@/lib/firebase/admin';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uid, email, role = 'admin' } = body;

    // Validate required fields
    if (!uid || !email) {
      return NextResponse.json(
        { error: 'uid y email son requeridos' },
        { status: 400 }
      );
    }

    console.log('[API /admin/users/create] Creating admin user:', {
      uid,
      email,
      role,
    });

    const db = getAdminFirestore();

    // Check if user already exists using Admin SDK
    const userDoc = await db.collection('users').doc(uid).get();
    if (userDoc.exists) {
      return NextResponse.json(
        { error: 'El usuario ya existe' },
        { status: 409 }
      );
    }

    // Create admin user using Admin SDK
    const userData = {
      email,
      personnel_id: '',
      rol: role,
      activo: true,
      created_at: new Date(),
      updated_at: new Date(),
    };

    await db.collection('users').doc(uid).set(userData);

    console.log(
      '[API /admin/users/create] Admin user created successfully:',
      uid
    );

    return NextResponse.json({
      user: { id: uid, ...userData },
      message: 'Usuario administrador creado exitosamente',
    });
  } catch (error) {
    console.error('[API /admin/users/create] Error:', error);

    return NextResponse.json(
      {
        error: 'Error al crear usuario administrador',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
