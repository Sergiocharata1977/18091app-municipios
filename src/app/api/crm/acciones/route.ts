import { getAdminFirestore } from '@/lib/firebase/admin';
import { CRMAccion } from '@/types/crmAcciones';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organization_id = searchParams.get('organization_id');
    const cliente_id = searchParams.get('cliente_id');
    const oportunidad_id = searchParams.get('oportunidad_id');
    const vendedor_id = searchParams.get('vendedor_id');
    const tipo = searchParams.get('tipo');
    const estado = searchParams.get('estado');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!organization_id) {
      return NextResponse.json(
        { error: 'organization_id requerido' },
        { status: 400 }
      );
    }

    const db = getAdminFirestore();
    // Usamos collectionGroup o ruta anidada.
    // Por simplicidad y escalabilidad multi-tenant, usaremos la ruta anidada propuesta en el plan:
    // organizations/{orgId}/crm_acciones

    let query = db
      .collection('organizations')
      .doc(organization_id)
      .collection('crm_acciones')
      .orderBy('createdAt', 'desc') // Orden por defecto: más recientes primero
      .limit(limit);

    // Filtros
    if (cliente_id) query = query.where('cliente_id', '==', cliente_id);
    if (oportunidad_id)
      query = query.where('oportunidad_id', '==', oportunidad_id);
    if (vendedor_id) query = query.where('vendedor_id', '==', vendedor_id);
    if (tipo) query = query.where('tipo', '==', tipo);
    if (estado) query = query.where('estado', '==', estado);

    // Nota: Firestore requiere índices compuestos para múltiples filtros + ordenamiento.
    // Si falla, el error indicará el link para crear el índice.

    const snapshot = await query.get();

    const acciones = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as CRMAccion[];

    return NextResponse.json({ acciones });
  } catch (error: any) {
    console.error('[API /crm/acciones] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { organization_id, ...data } = body;

    if (!organization_id) {
      return NextResponse.json(
        { error: 'organization_id requerido' },
        { status: 400 }
      );
    }

    const db = getAdminFirestore();
    const { Timestamp } = await import('firebase-admin/firestore');

    const nuevaAccion = {
      ...data,
      organization_id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Aseguramos estado default si no viene
      estado: data.estado || 'programada',
    };

    const docRef = await db
      .collection('organizations')
      .doc(organization_id)
      .collection('crm_acciones')
      .add(nuevaAccion);

    return NextResponse.json({
      success: true,
      id: docRef.id,
      accion: { id: docRef.id, ...nuevaAccion },
    });
  } catch (error: any) {
    console.error('[API /crm/acciones] Error creating:', error);
    return NextResponse.json(
      { error: error.message || 'Error creando acción' },
      { status: 500 }
    );
  }
}
