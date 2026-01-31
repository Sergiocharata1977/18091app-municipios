import {
  paginationSchema,
  trainingFiltersSchema,
  trainingSchema,
} from '@/lib/validations/rrhh';
import { CalendarService } from '@/services/calendar/CalendarService';
import { EventService } from '@/services/events/EventService';
import { TrainingService } from '@/services/rrhh/TrainingService';
import type { CalendarEventCreateData } from '@/types/calendar';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse filters
    const filters = trainingFiltersSchema.parse({
      search: searchParams.get('search') || undefined,
      estado: (searchParams.get('estado') as any) || undefined,
      modalidad: (searchParams.get('modalidad') as any) || undefined,
      fecha_inicio: searchParams.get('fecha_inicio')
        ? new Date(searchParams.get('fecha_inicio')!)
        : undefined,
      fecha_fin: searchParams.get('fecha_fin')
        ? new Date(searchParams.get('fecha_fin')!)
        : undefined,
    });

    // Parse pagination
    const pagination = paginationSchema.parse({
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '100'), // Default to 100 for listing
      sort: searchParams.get('sort') || undefined,
      order: searchParams.get('order') || 'desc',
    });

    const organizationId = searchParams.get('organization_id');

    if (!organizationId) {
      return NextResponse.json(
        { error: 'organization_id es requerido' },
        { status: 400 }
      );
    }

    const result = await TrainingService.getPaginated(
      organizationId,
      filters,
      pagination
    );

    // Return just the data array for compatibility with frontend
    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Error in trainings GET:', error);
    return NextResponse.json(
      { error: 'Error al obtener capacitaciones' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Pre-process dates (JSON converts Date to ISO string)
    const processedBody = {
      ...body,
      fecha_inicio: body.fecha_inicio ? new Date(body.fecha_inicio) : undefined,
      fecha_fin: body.fecha_fin ? new Date(body.fecha_fin) : undefined,
    };

    const validatedData = trainingSchema.parse(processedBody);

    // 1. Create training
    const training = await TrainingService.create(
      validatedData,
      validatedData.organization_id
    );

    // 2. Create calendar event
    try {
      const calendarEventData: CalendarEventCreateData = {
        title: `📚 Capacitación: ${training.tema}`,
        description: training.descripcion || null,
        date: training.fecha_inicio,
        endDate: training.fecha_fin,
        type: 'training',
        sourceModule: 'trainings',
        priority: 'medium',
        sourceRecordId: training.id,
        sourceRecordType: 'training',
        sourceRecordNumber: null,
        responsibleUserId: training.responsable_id || null,
        responsibleUserName: training.responsable_nombre || null,
        participantIds: training.participantes || null,
        organizationId: training.organization_id || '',
        processId: null,
        processName: null,
        metadata: {
          modalidad: training.modalidad,
          horas: training.horas,
          proveedor: training.proveedor,
          estado: training.estado,
          competenciasDesarrolladas: training.competenciasDesarrolladas,
        },
        notificationSchedule: {
          sevenDaysBefore: true,
          oneDayBefore: true,
          onEventDay: true,
          customDays: null,
        },
        isRecurring: false,
        recurrenceRule: null,
        createdBy: training.responsable_id || 'system',
        createdByName: training.responsable_nombre || 'Sistema',
        isSystemGenerated: true,
      };

      const calendarEventId =
        await CalendarService.createEvent(calendarEventData);

      // 3. Sync to unified events collection (solo datos comunes, sin duplicar)
      const eventId = await EventService.syncFromSource({
        organization_id: training.organization_id || '',
        titulo: `📚 Capacitación: ${training.tema}`,
        descripcion: training.descripcion,
        tipo_evento: 'capacitacion',
        fecha_inicio: training.fecha_inicio,
        fecha_fin: training.fecha_fin,
        responsable_id: training.responsable_id,
        responsable_nombre: training.responsable_nombre,
        estado: 'programado',
        prioridad: 'media',
        // Referencia al documento específico (sin duplicar sus datos)
        source_collection: 'trainings',
        source_id: training.id,
        created_by: training.responsable_id || 'system',
      });

      // 4. Update training with event IDs
      await TrainingService.update(training.id, {
        calendar_event_id: calendarEventId,
        event_id: eventId,
      });
      training.calendar_event_id = calendarEventId;
      training.event_id = eventId;
    } catch (calendarError) {
      console.error('Error creating calendar/event:', calendarError);
      // Don't fail the training creation if calendar fails
    }

    return NextResponse.json(training, { status: 201 });
  } catch (error) {
    console.error('Error in trainings POST:', error);

    if (
      error &&
      typeof error === 'object' &&
      'name' in error &&
      error.name === 'ZodError'
    ) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: (error as any).errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al crear capacitación' },
      { status: 500 }
    );
  }
}
