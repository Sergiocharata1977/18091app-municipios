import { performanceEvaluationSchema } from '@/lib/validations/rrhh';
import { CalendarService } from '@/services/calendar/CalendarService';
import { EventService } from '@/services/events/EventService';
import { EvaluationService } from '@/services/rrhh/EvaluationService';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const evaluation = await EvaluationService.getById(id);

    if (!evaluation) {
      return NextResponse.json(
        { error: 'Evaluación no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(evaluation);
  } catch (error) {
    console.error('Error in evaluation GET:', error);
    return NextResponse.json(
      { error: 'Error al obtener evaluación' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = performanceEvaluationSchema.parse(body);

    // Get current evaluation to check calendar_event_id
    const currentEvaluation = await EvaluationService.getById(id);

    // Update evaluation
    const evaluation = await EvaluationService.update(id, validatedData);

    // Update calendar event if exists
    if (currentEvaluation?.calendar_event_id) {
      try {
        await CalendarService.updateEvent(currentEvaluation.calendar_event_id, {
          title: `📋 Evaluación: ${evaluation.titulo || 'Sin título'}`,
          description: evaluation.comentarios_generales || null,
          date: evaluation.fecha_evaluacion,
          responsibleUserId: evaluation.responsable_id || null,
          responsibleUserName: evaluation.responsable_nombre || null,
          participantIds:
            evaluation.empleados_evaluados?.map(e => e.personnelId) || null,
          metadata: {
            tipo: evaluation.tipo,
            capacitacionId: evaluation.capacitacionId,
            estado: evaluation.estado,
            totalEmpleados: evaluation.empleados_evaluados?.length || 0,
            totalCompetencias: evaluation.competencias_a_evaluar?.length || 0,
          },
        });
      } catch (calendarError) {
        console.error('Error updating calendar event:', calendarError);
      }
    }

    // Sincronizar con colección events unificada (Nuevo sistema)
    try {
      await EventService.syncFromSource({
        organization_id: evaluation.organization_id || '',
        titulo: `📋 Evaluación: ${evaluation.titulo || 'Evaluación de desempeño'}`,
        descripcion: evaluation.comentarios_generales,
        tipo_evento: 'evaluacion',
        fecha_inicio: evaluation.fecha_evaluacion,
        responsable_id: evaluation.responsable_id,
        responsable_nombre: evaluation.responsable_nombre,
        estado: (evaluation.estado === 'cerrado'
          ? 'completado'
          : evaluation.estado === 'publicado'
            ? 'en_progreso'
            : 'programado') as any,
        prioridad: 'alta',
        source_collection: 'evaluations',
        source_id: evaluation.id,
        created_by: evaluation.responsable_id || 'system',
      });
    } catch (eventError) {
      console.error('Error updating unified event for evaluation:', eventError);
    }

    return NextResponse.json(evaluation);
  } catch (error) {
    console.error('Error in evaluation PUT:', error);

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
      { error: 'Error al actualizar evaluación' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get evaluation to check calendar_event_id
    const evaluation = await EvaluationService.getById(id);

    // Delete calendar event if exists
    if (evaluation?.calendar_event_id) {
      try {
        await CalendarService.deleteEvent(evaluation.calendar_event_id);
      } catch (calendarError) {
        console.error('Error deleting calendar event:', calendarError);
      }
    }

    // Eliminar evento unificado (Nuevo sistema)
    try {
      await EventService.deleteBySource('evaluations', id);
    } catch (eventError) {
      console.error('Error deleting unified event for evaluation:', eventError);
    }

    // Delete evaluation
    await EvaluationService.delete(id);

    return NextResponse.json({ message: 'Evaluación eliminada exitosamente' });
  } catch (error) {
    console.error('Error in evaluation DELETE:', error);
    return NextResponse.json(
      { error: 'Error al eliminar evaluación' },
      { status: 500 }
    );
  }
}

// PATCH for partial updates
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Get current evaluation to check calendar_event_id
    const currentEvaluation = await EvaluationService.getById(id);

    // Pre-process dates if present
    const processedBody: Record<string, any> = { ...body };

    if (body.fecha_evaluacion) {
      processedBody.fecha_evaluacion = new Date(body.fecha_evaluacion);
    }
    if (body.fechaProximaEvaluacion) {
      processedBody.fechaProximaEvaluacion = new Date(
        body.fechaProximaEvaluacion
      );
    }

    // Remove undefined values
    Object.keys(processedBody).forEach(key => {
      if (processedBody[key] === undefined) {
        delete processedBody[key];
      }
    });

    const evaluation = await EvaluationService.update(id, processedBody);

    // Update calendar event if exists and relevant fields changed
    if (currentEvaluation?.calendar_event_id) {
      try {
        const updateData: any = {};

        if (body.titulo !== undefined) {
          updateData.title = `📋 Evaluación: ${evaluation.titulo || 'Sin título'}`;
        }
        if (body.fecha_evaluacion !== undefined) {
          updateData.date = evaluation.fecha_evaluacion;
        }
        if (body.estado !== undefined) {
          const eventStatus =
            body.estado === 'cerrado'
              ? 'completed'
              : body.estado === 'publicado'
                ? 'in_progress'
                : 'scheduled';
          updateData.status = eventStatus;
        }
        if (body.responsable_id !== undefined) {
          updateData.responsibleUserId = evaluation.responsable_id || null;
          updateData.responsibleUserName =
            evaluation.responsable_nombre || null;
        }

        if (Object.keys(updateData).length > 0) {
          await CalendarService.updateEvent(
            currentEvaluation.calendar_event_id,
            updateData
          );
        }
      } catch (calendarError) {
        console.error('Error updating calendar event:', calendarError);
      }
    }

    // Sincronizar con evento unificado (Nuevo sistema)
    try {
      const unifiedStatus =
        evaluation.estado === 'cerrado'
          ? 'completado'
          : evaluation.estado === 'publicado'
            ? 'en_progreso'
            : 'programado';

      await EventService.syncFromSource({
        organization_id: evaluation.organization_id || '',
        titulo: `📋 Evaluación: ${evaluation.titulo || 'Evaluación de desempeño'}`,
        descripcion: evaluation.comentarios_generales,
        tipo_evento: 'evaluacion',
        fecha_inicio: evaluation.fecha_evaluacion,
        responsable_id: evaluation.responsable_id,
        responsable_nombre: evaluation.responsable_nombre,
        estado: unifiedStatus as any,
        prioridad: 'alta',
        source_collection: 'evaluations',
        source_id: evaluation.id,
        created_by: 'system',
      });
    } catch (eventError) {
      console.error('Error updating unified event in PATCH:', eventError);
    }

    return NextResponse.json(evaluation);
  } catch (error: any) {
    console.error('Error in evaluation PATCH:', error);
    return NextResponse.json(
      { error: 'Error al actualizar evaluación', details: error?.message },
      { status: 500 }
    );
  }
}
