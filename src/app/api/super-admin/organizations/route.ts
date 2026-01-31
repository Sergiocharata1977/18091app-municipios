import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/super-admin/organizations
 * Listar todas las organizaciones (solo super admin)
 */
import { getAdminFirestore } from '@/lib/firebase/admin';
export async function GET(req: NextRequest) {
  try {
    // TODO: Verificar autenticación super admin
    const db = getAdminFirestore();

    // Obtener todas las organizaciones
    const orgsSnapshot = await db.collection('organizations').get();

    const organizations = orgsSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ organizations });
  } catch (error) {
    console.error('Error al obtener organizaciones:', error);
    return NextResponse.json(
      { error: 'Error al obtener organizaciones' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/super-admin/organizations
 * Crear nueva organización (solo super admin)
 */
export async function POST(req: NextRequest) {
  try {
    // TODO: Verificar autenticación super admin
    const db = getAdminFirestore();
    const data = await req.json();

    // Validar datos requeridos
    if (!data.name || !data.plan) {
      return NextResponse.json(
        { error: 'Nombre y plan son requeridos' },
        { status: 400 }
      );
    }

    // Generar ID único
    const orgId = `org_${data.name
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '')}`;

    // Crear organización
    const orgData = {
      id: orgId,
      name: data.name,
      plan: data.plan || 'free',
      settings: {
        timezone: data.timezone || 'America/Argentina/Buenos_Aires',
        currency: data.currency || 'ARS',
        language: data.language || 'es',
      },
      features: {
        private_sections: data.features?.private_sections ?? true,
        ai_assistant: data.features?.ai_assistant ?? true,
        max_users: data.features?.max_users ?? 50,
      },
      created_at: new Date(),
      updated_at: new Date(),
    };

    await db.collection('organizations').doc(orgId).set(orgData);

    return NextResponse.json({ organization: orgData }, { status: 201 });
  } catch (error) {
    console.error('Error al crear organización:', error);
    return NextResponse.json(
      { error: 'Error al crear organización' },
      { status: 500 }
    );
  }
}
