import { adminDb } from '@/firebase/admin';
import { AuditService } from '@/lib/sdk/modules/audits';
import { CreateAuditSchema } from '@/lib/sdk/modules/audits/validations';
import { EventService } from '@/services/events/EventService';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const organizationId = searchParams.get('organization_id');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!organizationId) {
      return NextResponse.json(
        { success: false, error: 'organization_id es requerido' },
        { status: 400 }
      );
    }

    const service = new AuditService();
    let audits;

    const filters: any = { organization_id: organizationId };
    if (status) {
      filters.status = status;
    }

    audits = await service.list(filters, { limit, offset });

    return NextResponse.json(
      {
        success: true,
        data: audits,
        count: audits.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/sdk/audits:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener auditorías',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // MULTI-TENANT: Validar organization_id
    if (!body.organization_id) {
      return NextResponse.json(
        { success: false, error: 'organization_id es requerido' },
        { status: 400 }
      );
    }

    const validated = CreateAuditSchema.parse(body);

    const service = new AuditService();
    // TODO: Obtener userId real del Auth session
    const userId = body.userId || 'system';
    const id = await service.createAndReturnId(
      {
        ...validated,
        organization_id: body.organization_id,
        leadAuditorId: body.leadAuditorId, // Agregar soporte para ID si viene del formulario
        leadAuditorName: body.leadAuditorName || validated.leadAuditor,
      } as any,
      userId
    );

    // Sincronizar con colección events unificada
    try {
      const eventId = await EventService.syncFromSource({
        organization_id: body.organization_id,
        titulo: `🔍 Auditoría: ${validated.title}`,
        descripcion: validated.scope,
        tipo_evento: 'auditoria',
        fecha_inicio: validated.plannedDate,
        responsable_id: body.leadAuditorId || '',
        responsable_nombre: body.leadAuditorName || validated.leadAuditor,
        estado: 'programado',
        prioridad: 'alta',
        source_collection: 'audits',
        source_id: id,
        created_by: userId,
      });

      // Actualizar auditoría con event_id usando adminDb
      await adminDb.collection('audits').doc(id).update({ event_id: eventId });

      console.log(
        `[Audits API] Sincronizado evento ${eventId} para auditoría ${id}`
      );
    } catch (eventError) {
      console.error('Error syncing audit to events:', eventError);
    }

    return NextResponse.json(
      {
        success: true,
        data: { id },
        message: 'Auditoría creada exitosamente',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/sdk/audits:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        {
          success: false,
          error: 'Datos de validación incorrectos',
          details: (error as any).errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Error al crear auditoría',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
