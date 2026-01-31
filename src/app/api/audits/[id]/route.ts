/**
 * Audit API Routes (by ID)
 *
 * Endpoints for managing individual audits using the SDK
 */

import { AuditService } from '@/lib/sdk/modules/audits';
import { NextRequest, NextResponse } from 'next/server';

// ============================================
// GET - Get audit by ID
// ============================================

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const auditService = new AuditService();
    const { params } = context;
    const audit = await auditService.getById(params.id);

    return NextResponse.json({
      success: true,
      data: audit,
    });
  } catch (error) {
    console.error('Error getting audit:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener auditoría' },
      { status: 500 }
    );
  }
}

// ============================================
// PUT - Update audit
// ============================================

export async function PUT(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const auditService = new AuditService();
    const { params } = context;
    const body = await req.json();

    // Convert date if exists
    if (body.plannedDate) {
      body.plannedDate = new Date(body.plannedDate);
    }

    // TODO: Get real user ID from auth
    const userId = 'temp-user-id';

    await auditService.update(params.id, body, userId);

    return NextResponse.json({
      success: true,
      message: 'Auditoría actualizada exitosamente',
    });
  } catch (error) {
    console.error('Error updating audit:', error);
    return NextResponse.json(
      { success: false, error: 'Error al actualizar auditoría' },
      { status: 500 }
    );
  }
}

// ============================================
// DELETE - Delete audit
// ============================================

export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const auditService = new AuditService();
    const { params } = context;

    await auditService.delete(params.id);

    return NextResponse.json({
      success: true,
      message: 'Auditoría eliminada exitosamente',
    });
  } catch (error) {
    console.error('Error deleting audit:', error);
    return NextResponse.json(
      { success: false, error: 'Error al eliminar auditoría' },
      { status: 500 }
    );
  }
}
