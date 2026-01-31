import { trainingSchema } from '@/lib/validations/rrhh';
import { CalendarService } from '@/services/calendar/CalendarService';
import { EventService } from '@/services/events/EventService';
import { TrainingService } from '@/services/rrhh/TrainingService';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const training = await TrainingService.getById(id);

    if (!training) {
      return NextResponse.json(
        { error: 'Capacitación no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(training);
  } catch (error) {
    console.error('Error in training GET:', error);
    return NextResponse.json(
      { error: 'Error al obtener capacitación' },
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
    const validatedData = trainingSchema.parse(body);

    // Get current training to check calendar_event_id
    const currentTraining = await TrainingService.getById(id);

    // Update training
    const training = await TrainingService.update(id, validatedData);

    // Update calendar event if exists
    if (currentTraining?.calendar_event_id) {
      try {
        await CalendarService.updateEvent(currentTraining.calendar_event_id, {
          title: `📚 Capacitación: ${training.tema}`,
          description: training.descripcion || null,
          date: training.fecha_inicio,
          endDate: training.fecha_fin,
          responsibleUserId: training.responsable_id || null,
          responsibleUserName: training.responsable_nombre || null,
          participantIds: training.participantes || null,
          metadata: {
            modalidad: training.modalidad,
            horas: training.horas,
            proveedor: training.proveedor,
            estado: training.estado,
            competenciasDesarrolladas: training.competenciasDesarrolladas,
          },
        });
      } catch (calendarError) {
        console.error('Error updating calendar event:', calendarError);
      }
    }

    // Sincronizar con colección events unificada (Nuevo sistema)
    try {
      await EventService.syncFromSource({
        organization_id: training.organization_id || '',
        titulo: `📚 Capacitación: ${training.tema}`,
        descripcion: training.descripcion,
        tipo_evento: 'capacitacion',
        fecha_inicio: training.fecha_inicio,
        fecha_fin: training.fecha_fin,
        responsable_id: training.responsable_id,
        responsable_nombre: training.responsable_nombre,
        estado: (training.estado === 'completada'
          ? 'completado'
          : training.estado === 'cancelada'
            ? 'cancelado'
            : 'programado') as any,
        prioridad: 'media',
        source_collection: 'trainings',
        source_id: training.id,
        created_by: training.responsable_id || 'system',
      });
    } catch (eventError) {
      console.error('Error updating unified event:', eventError);
    }

    return NextResponse.json(training);
  } catch (error) {
    console.error('Error in training PUT:', error);

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
      { error: 'Error al actualizar capacitación' },
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

    // Get training to check calendar_event_id
    const training = await TrainingService.getById(id);

    // Delete calendar event if exists
    if (training?.calendar_event_id) {
      try {
        await CalendarService.deleteEvent(training.calendar_event_id);
      } catch (calendarError) {
        console.error('Error deleting calendar event:', calendarError);
      }
    }

    // Eliminar evento unificado (Nuevo sistema)
    try {
      await EventService.deleteBySource('trainings', id);
    } catch (eventError) {
      console.error('Error deleting unified event for training:', eventError);
    }

    // Delete training
    await TrainingService.delete(id);

    return NextResponse.json({
      message: 'Capacitación eliminada exitosamente',
    });
  } catch (error) {
    console.error('Error in training DELETE:', error);
    return NextResponse.json(
      { error: 'Error al eliminar capacitación' },
      { status: 500 }
    );
  }
}

// PATCH for status updates and participant management
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (body.action === 'update_status' && body.status) {
      const training = await TrainingService.updateStatus(id, body.status);

      // Update calendar event status if exists
      if (training.calendar_event_id) {
        try {
          const eventStatus =
            body.status === 'completada'
              ? 'completed'
              : body.status === 'cancelada'
                ? 'cancelled'
                : body.status === 'en_curso'
                  ? 'in_progress'
                  : 'scheduled';

          await CalendarService.updateEvent(training.calendar_event_id, {
            status: eventStatus as any,
          });
        } catch (calendarError) {
          console.error('Error updating calendar event status:', calendarError);
        }
      }

      // Sincronizar estado con evento unificado
      try {
        const unifiedStatus =
          body.status === 'completada'
            ? 'completado'
            : body.status === 'cancelada'
              ? 'cancelado'
              : 'programado';

        await EventService.syncFromSource({
          organization_id: training.organization_id || '',
          titulo: `📚 Capacitación: ${training.tema}`,
          descripcion: training.descripcion,
          tipo_evento: 'capacitacion',
          fecha_inicio: training.fecha_inicio,
          fecha_fin: training.fecha_fin,
          responsable_id: training.responsable_id,
          responsable_nombre: training.responsable_nombre,
          estado: unifiedStatus as any,
          prioridad: 'media',
          source_collection: 'trainings',
          source_id: training.id,
          created_by: 'system',
        });
      } catch (eventError) {
        console.error('Error updating unified event status:', eventError);
      }

      return NextResponse.json(training);
    }

    if (body.action === 'add_participant' && body.participant_id) {
      const training = await TrainingService.addParticipant(
        id,
        body.participant_id
      );

      // Update calendar event participants if exists
      if (training.calendar_event_id) {
        try {
          await CalendarService.updateEvent(training.calendar_event_id, {
            participantIds: training.participantes || null,
          });
        } catch (calendarError) {
          console.error(
            'Error updating calendar event participants:',
            calendarError
          );
        }
      }

      return NextResponse.json(training);
    }

    if (body.action === 'remove_participant' && body.participant_id) {
      const training = await TrainingService.removeParticipant(
        id,
        body.participant_id
      );

      // Update calendar event participants if exists
      if (training.calendar_event_id) {
        try {
          await CalendarService.updateEvent(training.calendar_event_id, {
            participantIds: training.participantes || null,
          });
        } catch (calendarError) {
          console.error(
            'Error updating calendar event participants:',
            calendarError
          );
        }
      }

      return NextResponse.json(training);
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
  } catch (error) {
    console.error('Error in training PATCH:', error);
    return NextResponse.json(
      { error: 'Error al actualizar capacitación' },
      { status: 500 }
    );
  }
}
