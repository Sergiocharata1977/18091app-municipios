/**
 * Audit Detail API Route - SDK Unified
 *
 * GET /api/sdk/audits/[id] - Get audit by ID
 * PUT /api/sdk/audits/[id] - Update audit
 * DELETE /api/sdk/audits/[id] - Delete audit
 */

import { AuditService } from '@/lib/sdk/modules/audits';
import { EventService } from '@/services/events/EventService';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'ID de auditoría requerido' },
        { status: 400 }
      );
    }

    const service = new AuditService();
    const audit = await service.getById(id);

    if (!audit) {
      return NextResponse.json(
        { error: 'Auditoría no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: audit }, { status: 200 });
  } catch (error) {
    console.error(`Error in GET /api/sdk/audits/${params.id}:`, error);
    return NextResponse.json(
      {
        error: 'Error al obtener auditoría',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'ID de auditoría requerido' },
        { status: 400 }
      );
    }

    const service = new AuditService();
    await service.update(id, body, 'system');

    // Sincronizar actualización con el evento del calendario
    try {
      // Obtener datos actuales de la auditoría para sincronizar
      const audit = await service.getById(id);
      if (audit) {
        const plannedDateValue = audit.plannedDate;
        const fechaInicio =
          plannedDateValue &&
          typeof (plannedDateValue as any).toDate === 'function'
            ? (plannedDateValue as any).toDate()
            : new Date(plannedDateValue as any);

        await EventService.syncFromSource({
          organization_id:
            (audit as any).organization_id || body.organization_id || '',
          titulo: `🔍 Auditoría: ${audit.title}`,
          descripcion: audit.scope,
          tipo_evento: 'auditoria',
          fecha_inicio: fechaInicio,
          responsable_id: (audit as any).leadAuditorId || '',
          responsable_nombre: audit.leadAuditor,
          estado: (audit.status === 'planned'
            ? 'programado'
            : audit.status === 'in_progress'
              ? 'en_progreso'
              : audit.status === 'completed'
                ? 'completado'
                : 'programado') as any,
          prioridad: 'alta',
          source_collection: 'audits',
          source_id: id,
          created_by: 'system',
        });
      }
    } catch (eventError) {
      console.error('Error syncing audit update to events:', eventError);
    }

    return NextResponse.json(
      { message: 'Auditoría actualizada exitosamente', id },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error in PUT /api/sdk/audits/${params.id}:`, error);
    return NextResponse.json(
      {
        error: 'Error al actualizar auditoría',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'ID de auditoría requerido' },
        { status: 400 }
      );
    }

    const service = new AuditService();
    await service.delete(id);

    // Eliminar evento asociado del calendario
    try {
      await EventService.deleteBySource('audits', id);
    } catch (eventError) {
      console.error('Error deleting event for audit:', eventError);
    }

    return NextResponse.json(
      { message: 'Auditoría eliminada exitosamente', id },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error in DELETE /api/sdk/audits/${params.id}:`, error);
    return NextResponse.json(
      {
        error: 'Error al eliminar auditoría',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
