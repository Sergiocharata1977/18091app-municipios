import {
  paginationSchema,
  performanceEvaluationFiltersSchema,
  performanceEvaluationSchema,
} from '@/lib/validations/rrhh';
import { CalendarService } from '@/services/calendar/CalendarService';
import { EventService } from '@/services/events/EventService';
import { EvaluationService } from '@/services/rrhh/EvaluationService';
import type { CalendarEventCreateData } from '@/types/calendar';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse filters
    const filters = performanceEvaluationFiltersSchema.parse({
      search: searchParams.get('search') || undefined,
      estado: (searchParams.get('estado') as any) || undefined,
      periodo: searchParams.get('periodo') || undefined,
      personnel_id: searchParams.get('personnel_id') || undefined,
      evaluador_id: searchParams.get('evaluador_id') || undefined,
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

    const result = await EvaluationService.getPaginated(
      organizationId,
      filters,
      pagination
    );

    // Return just the data array for compatibility with frontend
    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Error in evaluations GET:', error);
    return NextResponse.json(
      { error: 'Error al obtener evaluaciones' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log(
      '[Evaluations POST] Received body:',
      JSON.stringify(body, null, 2)
    );

    // Pre-process dates (JSON converts Date to ISO string)
    const processedBody = {
      ...body,
      fecha_evaluacion: body.fecha_evaluacion
        ? new Date(body.fecha_evaluacion)
        : new Date(),
      fechaProximaEvaluacion: body.fechaProximaEvaluacion
        ? new Date(body.fechaProximaEvaluacion)
        : null,
      // Ensure defaults for optional fields
      competencias: body.competencias || [],
      estado: body.estado || 'borrador',
      resultado_global: body.resultado_global || 'Requiere Capacitación',
    };

    console.log(
      '[Evaluations POST] Processed body:',
      JSON.stringify(processedBody, null, 2)
    );

    const validatedData = performanceEvaluationSchema.parse(processedBody);

    console.log(
      '[Evaluations POST] Validated data:',
      JSON.stringify(validatedData, null, 2)
    );

    // 1. Create evaluation
    const evaluation = await EvaluationService.create(validatedData);

    // 2. Create calendar event
    try {
      const calendarEventData: CalendarEventCreateData = {
        title: `📋 Evaluación: ${evaluation.titulo || 'Sin título'}`,
        description: evaluation.comentarios_generales || null,
        date: evaluation.fecha_evaluacion,
        endDate: null,
        type: 'evaluation',
        sourceModule: 'evaluations',
        priority: 'high',
        sourceRecordId: evaluation.id,
        sourceRecordType: 'evaluation',
        sourceRecordNumber: null,
        responsibleUserId: evaluation.responsable_id || null,
        responsibleUserName: evaluation.responsable_nombre || null,
        participantIds:
          evaluation.empleados_evaluados?.map(e => e.personnelId) || null,
        organizationId: evaluation.organization_id || '',
        processId: null,
        processName: null,
        metadata: {
          tipo: evaluation.tipo,
          capacitacionId: evaluation.capacitacionId,
          estado: evaluation.estado,
          totalEmpleados: evaluation.empleados_evaluados?.length || 0,
          totalCompetencias: evaluation.competencias_a_evaluar?.length || 0,
        },
        notificationSchedule: {
          sevenDaysBefore: true,
          oneDayBefore: true,
          onEventDay: true,
          customDays: null,
        },
        isRecurring: false,
        recurrenceRule: null,
        createdBy: evaluation.responsable_id || 'system',
        createdByName: evaluation.responsable_nombre || 'Sistema',
        isSystemGenerated: true,
      };

      const calendarEventId =
        await CalendarService.createEvent(calendarEventData);

      // 3. Sync to unified events collection (solo datos comunes, sin duplicar)
      const eventId = await EventService.syncFromSource({
        organization_id: evaluation.organization_id || '',
        titulo: `📋 Evaluación: ${evaluation.titulo || 'Evaluación de desempeño'}`,
        descripcion: evaluation.comentarios_generales,
        tipo_evento: 'evaluacion',
        fecha_inicio: evaluation.fecha_evaluacion,
        responsable_id: evaluation.responsable_id,
        responsable_nombre: evaluation.responsable_nombre,
        estado: 'programado',
        prioridad: 'alta',
        // Referencia al documento específico (sin duplicar sus datos)
        source_collection: 'evaluations',
        source_id: evaluation.id,
        created_by: evaluation.responsable_id || 'system',
      });

      // 4. Update evaluation with event IDs
      await EvaluationService.update(evaluation.id, {
        calendar_event_id: calendarEventId,
        event_id: eventId,
      });
      evaluation.calendar_event_id = calendarEventId;
      evaluation.event_id = eventId;
    } catch (calendarError) {
      console.error('Error creating calendar/event:', calendarError);
      // Don't fail the evaluation creation if calendar fails
    }

    return NextResponse.json(evaluation, { status: 201 });
  } catch (error: any) {
    console.error('[Evaluations POST] Error:', error);
    console.error('[Evaluations POST] Error message:', error?.message);
    console.error('[Evaluations POST] Error stack:', error?.stack);

    if (
      error &&
      typeof error === 'object' &&
      'name' in error &&
      error.name === 'ZodError'
    ) {
      console.error(
        '[Evaluations POST] Zod errors:',
        JSON.stringify((error as any).errors, null, 2)
      );
      return NextResponse.json(
        { error: 'Datos inválidos', details: (error as any).errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al crear evaluación', details: error?.message },
      { status: 500 }
    );
  }
}
