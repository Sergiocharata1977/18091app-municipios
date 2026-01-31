import { getAdminFirestore } from '@/lib/firebase/admin';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, company, whatsapp, employees, hasISO, message } = body;

    // Validar datos requeridos
    if (!name || !email || !company || !whatsapp) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Guardar en Firestore usando Admin SDK
    const db = getAdminFirestore();
    const demoRequestsRef = db.collection('demo_requests');
    const docRef = await demoRequestsRef.add({
      name,
      email,
      company,
      whatsapp,
      employees: employees || 'No especificado',
      hasISO: hasISO || false,
      message: message || '',
      status: 'pending', // pending, contacted, closed
      created_at: new Date(),
      updated_at: new Date(),
    });

    return NextResponse.json({
      success: true,
      id: docRef.id,
      message: 'Solicitud guardada correctamente',
    });
  } catch (error) {
    console.error('Error guardando solicitud de demo:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
