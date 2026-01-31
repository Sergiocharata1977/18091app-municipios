import { getAdminAuth, getAdminFirestore } from '@/lib/firebase/admin';
import { NextRequest, NextResponse } from 'next/server';

// Generar contraseña aleatoria segura
function generatePassword(length = 10): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      demoRequestId,
      name,
      email,
      company,
      whatsapp,
      trialDays = 30,
    } = body;

    // Validar datos requeridos
    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email y nombre son requeridos' },
        { status: 400 }
      );
    }

    const auth = getAdminAuth();
    const db = getAdminFirestore();
    const password = generatePassword();

    // Verificar si el usuario ya existe
    try {
      const existingUser = await auth.getUserByEmail(email);
      if (existingUser) {
        return NextResponse.json(
          {
            error: 'Ya existe un usuario con este email',
            existingUserId: existingUser.uid,
          },
          { status: 409 }
        );
      }
    } catch (error: any) {
      // Si el error es "user-not-found", está bien, continuamos
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }
    }

    // Crear usuario en Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
      emailVerified: false,
    });

    // Calcular fechas de trial
    const now = new Date();
    const expirationDate = new Date();
    expirationDate.setDate(now.getDate() + trialDays);

    // Crear documento de usuario en Firestore
    await db.collection('users').doc(userRecord.uid).set({
      email,
      personnel_id: null,
      rol: 'admin', // Por defecto admin de su organización
      activo: true,
      status: 'active',
      planType: 'trial',
      trialStartDate: now,
      expirationDate: expirationDate,
      organization_id: null, // Se asignará después si es necesario
      modulos_habilitados: null,
      created_at: now,
      updated_at: now,
      // Datos adicionales del prospecto
      company_name: company,
      phone: whatsapp,
      source: 'demo_request',
    });

    // Actualizar la solicitud de demo como "activated"
    if (demoRequestId) {
      await db.collection('demo_requests').doc(demoRequestId).update({
        status: 'activated',
        activated_user_id: userRecord.uid,
        activated_at: now,
        updated_at: now,
      });
    }

    return NextResponse.json({
      success: true,
      userId: userRecord.uid,
      email,
      password, // Devolvemos la contraseña para mostrarla al admin
      trialDays,
      expirationDate: expirationDate.toISOString(),
    });
  } catch (error: any) {
    console.error('Error creando usuario desde demo:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
