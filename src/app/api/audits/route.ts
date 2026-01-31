/**
 * Audits API Routes
 *
 * Endpoints for managing audits using the SDK
 * Protected by authentication middleware
 */

import { adminDb } from '@/firebase/admin';
import { AuthenticatedRequest, withAuth } from '@/lib/sdk/middleware/auth';
import { AuditService } from '@/lib/sdk/modules/audits';
import { EventService } from '@/services/events/EventService';
import { NextResponse } from 'next/server';

// ============================================
// GET - List audits (Authenticated)
// ============================================

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const auditService = new AuditService();
    const searchParams = req.nextUrl.searchParams;

    const filters: Record<string, unknown> = {};

    // MULTI-TENANT: Filtrar por organization_id
    const organizationId = searchParams.get('organization_id');
    if (!organizationId) {
      return NextResponse.json(
        { success: false, error: 'organization_id es requerido' },
        { status: 400 }
      );
    }
    filters.organization_id = organizationId;

    if (searchParams.get('status')) {
      filters.status = searchParams.get('status');
    }

    if (searchParams.get('auditType')) {
      filters.auditType = searchParams.get('auditType');
    }

    const limit = searchParams.get('pageSize')
      ? parseInt(searchParams.get('pageSize')!)
      : 50;

    const audits = await auditService.list(filters, { limit });

    return NextResponse.json({
      success: true,
      data: audits,
    });
  } catch (error) {
    console.error('Error listing audits:', error);
    return NextResponse.json(
      { success: false, error: 'Error al listar auditorías' },
      { status: 500 }
    );
  }
});

// ============================================
// POST - Create audit (Authenticated)
// ============================================

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const auditService = new AuditService();
    const body = await req.json();

    // MULTI-TENANT: Validar organization_id
    if (!body.organization_id) {
      return NextResponse.json(
        { success: false, error: 'organization_id es requerido' },
        { status: 400 }
      );
    }

    // Convert date string to Date
    if (body.plannedDate) {
      body.plannedDate = new Date(body.plannedDate);
    }

    // Get user ID from authenticated context
    const userId = req.user.uid;

    const auditId = await auditService.createAndReturnId(body, userId);

    // Sincronizar con colección events unificada
    try {
      const eventId = await EventService.syncFromSource({
        organization_id: body.organization_id,
        titulo: `🔍 Auditoría: ${body.title || body.code || 'Nueva auditoría'}`,
        descripcion: body.scope || body.objectives,
        tipo_evento: 'auditoria',
        fecha_inicio: body.plannedDate,
        fecha_fin: body.endDate,
        responsable_id: body.leadAuditorId,
        responsable_nombre: body.leadAuditorName,
        estado: 'programado',
        prioridad: 'alta',
        source_collection: 'audits',
        source_id: auditId,
        created_by: userId,
      });

      // Actualizar auditoría con event_id usando adminDb
      await adminDb
        .collection('audits')
        .doc(auditId)
        .update({ event_id: eventId });
    } catch (eventError) {
      console.error('Error syncing audit to events:', eventError);
      // No falla la creación de auditoría si falla el evento
    }

    return NextResponse.json(
      {
        success: true,
        data: { id: auditId },
        message: 'Auditoría creada exitosamente',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating audit:', error);
    return NextResponse.json(
      { success: false, error: 'Error al crear auditoría' },
      { status: 500 }
    );
  }
});
