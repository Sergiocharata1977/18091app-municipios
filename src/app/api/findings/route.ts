import { adminDb } from '@/firebase/admin';
import { FindingFormSchema } from '@/lib/validations/findings';
import { EventService } from '@/services/events/EventService';
import { FindingService } from '@/services/findings/FindingService';
import type { FindingStatus } from '@/types/findings';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/findings - Listar hallazgos
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // MULTI-TENANT: Validar organization_id
    const organizationId = searchParams.get('organization_id');
    if (!organizationId) {
      return NextResponse.json(
        { error: 'organization_id es requerido' },
        { status: 400 }
      );
    }

    const filters = {
      organization_id: organizationId,
      status: (searchParams.get('status') as FindingStatus) || undefined,
      processId: searchParams.get('processId') || undefined,
      sourceId: searchParams.get('sourceId') || undefined,
      year: searchParams.get('year')
        ? parseInt(searchParams.get('year')!)
        : undefined,
      search: searchParams.get('search') || undefined,
      requiresAction: searchParams.get('requiresAction')
        ? searchParams.get('requiresAction') === 'true'
        : undefined,
    };

    const { findings } = await FindingService.list(organizationId, filters);

    return NextResponse.json({ findings });
  } catch (error) {
    console.error('Error in GET /api/findings:', error);
    return NextResponse.json(
      { error: 'Error al obtener hallazgos' },
      { status: 500 }
    );
  }
}

// POST /api/findings - Crear hallazgo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // MULTI-TENANT: Validar organization_id
    if (!body.organization_id) {
      return NextResponse.json(
        { error: 'organization_id es requerido' },
        { status: 400 }
      );
    }

    // Validar datos
    const validatedData = FindingFormSchema.parse(body);

    // Crear hallazgo
    const findingId = await FindingService.create(
      validatedData,
      'system',
      body.userName || 'Usuario',
      body.organization_id
    );

    // Sincronizar con colección events unificada
    try {
      const eventId = await EventService.syncFromSource({
        organization_id: body.organization_id,
        titulo: `🔎 Hallazgo: ${validatedData.name}`,
        descripcion: validatedData.description,
        tipo_evento: 'hallazgo',
        fecha_inicio: new Date(),
        estado: 'programado',
        prioridad: 'alta',
        source_collection: 'findings',
        source_id: findingId,
        created_by: 'system',
      });

      // Actualizar hallazgo con event_id usando adminDb directamente
      await adminDb
        .collection('findings')
        .doc(findingId)
        .update({ event_id: eventId });
    } catch (eventError) {
      console.error('Error syncing finding to events:', eventError);
    }

    return NextResponse.json({ id: findingId }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/findings:', error);
    return NextResponse.json(
      { error: 'Error al crear hallazgo' },
      { status: 500 }
    );
  }
}
