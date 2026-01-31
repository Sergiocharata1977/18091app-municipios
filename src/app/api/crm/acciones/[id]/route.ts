import { getAdminFirestore } from '@/lib/firebase/admin';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { organization_id, ...updates } = body;

    if (!organization_id) {
      return NextResponse.json(
        { error: 'organization_id requerido' },
        { status: 400 }
      );
    }

    const { id } = params;
    const db = getAdminFirestore();
    const docRef = db
      .collection('organizations')
      .doc(organization_id)
      .collection('crm_acciones')
      .doc(id);

    // Verificar existencia
    const doc = await docRef.get();
    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Acción no encontrada' },
        { status: 404 }
      );
    }

    // Actualizar
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await docRef.update(updateData);

    return NextResponse.json({
      success: true,
      id,
      updates: updateData,
    });
  } catch (error: any) {
    console.error('[API /crm/acciones/[id]] PUT Error:', error);
    return NextResponse.json(
      { error: error.message || 'Error actualizando acción' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const organization_id = searchParams.get('organization_id');

    if (!organization_id) {
      return NextResponse.json(
        { error: 'organization_id requerido param' },
        { status: 400 }
      );
    }

    const { id } = params;
    const db = getAdminFirestore();
    const docRef = db
      .collection('organizations')
      .doc(organization_id)
      .collection('crm_acciones')
      .doc(id);

    await docRef.delete();

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error('[API /crm/acciones/[id]] DELETE Error:', error);
    return NextResponse.json(
      { error: error.message || 'Error eliminando acción' },
      { status: 500 }
    );
  }
}
