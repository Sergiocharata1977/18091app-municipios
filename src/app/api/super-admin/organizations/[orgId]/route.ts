import { getAdminFirestore } from '@/lib/firebase/admin';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/super-admin/organizations/[orgId]
 * Obtener detalles de una organización
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { orgId: string } }
) {
  try {
    const db = getAdminFirestore();
    const orgDoc = await db.collection('organizations').doc(params.orgId).get();

    if (!orgDoc.exists) {
      return NextResponse.json(
        { error: 'Organización no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      organization: {
        id: orgDoc.id,
        ...orgDoc.data(),
      },
    });
  } catch (error) {
    console.error('Error al obtener organización:', error);
    return NextResponse.json(
      { error: 'Error al obtener organización' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/super-admin/organizations/[orgId]
 * Actualizar organización
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { orgId: string } }
) {
  try {
    const db = getAdminFirestore();
    const data = await req.json();

    await db
      .collection('organizations')
      .doc(params.orgId)
      .update({
        ...data,
        updated_at: new Date(),
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al actualizar organización:', error);
    return NextResponse.json(
      { error: 'Error al actualizar organización' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/super-admin/organizations/[orgId]
 * Eliminar organización
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { orgId: string } }
) {
  try {
    const db = getAdminFirestore();

    // TODO: Verificar que no haya usuarios activos
    // TODO: Mover datos a archivo antes de eliminar

    await db.collection('organizations').doc(params.orgId).delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar organización:', error);
    return NextResponse.json(
      { error: 'Error al eliminar organización' },
      { status: 500 }
    );
  }
}
