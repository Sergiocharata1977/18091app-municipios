/**
 * API Route: PATCH /api/audits/[id]/comments
 * Updates the initialComments and finalReport fields of an audit
 */

import { getAdminFirestore } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: auditId } = params;
    const body = await request.json();

    const { initialComments, finalReport } = body;

    const db = getAdminFirestore();
    const auditRef = db.collection('audits').doc(auditId);

    // Verify audit exists
    const auditDoc = await auditRef.get();
    if (!auditDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Auditoría no encontrada' },
        { status: 404 }
      );
    }

    // Update only the comment fields
    const updateData: any = {
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (initialComments !== undefined) {
      updateData.initialComments = initialComments;
    }

    if (finalReport !== undefined) {
      updateData.finalReport = finalReport;
    }

    await auditRef.update(updateData);

    return NextResponse.json({
      success: true,
      message: 'Comentarios actualizados correctamente',
    });
  } catch (error) {
    console.error('Error updating audit comments:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al actualizar comentarios',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
