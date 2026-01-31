// API endpoint to auto-create personnel for existing user

import { getAdminAuth, getAdminFirestore } from '@/lib/firebase/admin';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, email, nombres, apellidos, role } = body;

    // Validate required fields
    if (!userId || !email) {
      return NextResponse.json(
        { error: 'userId y email son requeridos' },
        { status: 400 }
      );
    }

    const auth = getAdminAuth();
    const db = getAdminFirestore();

    console.log(
      '[API /personnel/auto-create] Creating personnel for user:',
      userId
    );

    // Check if user exists in Auth
    try {
      await auth.getUser(userId);
    } catch {
      return NextResponse.json(
        { error: 'Usuario no encontrado en Firebase Auth' },
        { status: 404 }
      );
    }

    // Check if user already has personnel linked
    const userDoc = await db.collection('users').doc(userId).get();
    if (userDoc.exists && userDoc.data()?.personnel_id) {
      return NextResponse.json(
        { error: 'El usuario ya tiene personal vinculado' },
        { status: 409 }
      );
    }

    // Check if email already exists in personnel
    const existingPersonnel = await db
      .collection('personnel')
      .where('email', '==', email)
      .limit(1)
      .get();

    if (!existingPersonnel.empty) {
      const personnelDoc = existingPersonnel.docs[0];

      // If personnel exists but not linked, link it
      await db.collection('users').doc(userId).update({
        personnel_id: personnelDoc.id,
        updated_at: new Date(),
      });

      await db.collection('personnel').doc(personnelDoc.id).update({
        user_id: userId,
        tiene_acceso_sistema: true,
        updated_at: new Date(),
      });

      // Update custom claims
      await auth.setCustomUserClaims(userId, {
        role: role || 'operario',
        personnelId: personnelDoc.id,
      });

      console.log(
        '[API /personnel/auto-create] Linked existing personnel:',
        personnelDoc.id
      );

      return NextResponse.json({
        success: true,
        message: 'Personal existente vinculado al usuario',
        personnelId: personnelDoc.id,
        linked: true,
      });
    }

    // Create new personnel record
    const personnelData = {
      nombres: nombres || email.split('@')[0],
      apellidos: apellidos || '',
      email,
      estado: 'Activo' as const,
      tipo_personal:
        role === 'admin'
          ? 'Directivo'
          : role === 'jefe'
            ? 'Supervisor'
            : 'Operativo',
      fecha_ingreso: new Date(),
      tiene_acceso_sistema: true,
      user_id: userId,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const personnelRef = await db.collection('personnel').add(personnelData);
    const personnelId = personnelRef.id;

    console.log('[API /personnel/auto-create] Personnel created:', personnelId);

    // Update user record with personnel_id
    await db.collection('users').doc(userId).update({
      personnel_id: personnelId,
      updated_at: new Date(),
    });

    // Update custom claims
    await auth.setCustomUserClaims(userId, {
      role: role || 'operario',
      personnelId,
    });

    console.log(
      '[API /personnel/auto-create] User updated with personnel link'
    );

    return NextResponse.json({
      success: true,
      message: 'Personal creado y vinculado exitosamente',
      personnelId,
      created: true,
    });
  } catch (error) {
    console.error('[API /personnel/auto-create] Error:', error);
    return NextResponse.json(
      {
        error: 'Error al crear personal',
        message: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
