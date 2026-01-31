import { CalendarEventUpdateSchema } from '@/lib/validations/calendar';
import { CalendarService } from '@/services/calendar/CalendarService';
import type { CalendarEventUpdateData } from '@/types/calendar';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/calendar/events/[id]
 * Obtener un evento por ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const event = await CalendarService.getEventById(id);

    if (!event) {
      return NextResponse.json(
        { error: 'Evento no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ event });
  } catch (error) {
    console.error('Error in GET /api/calendar/events/[id]:', error);
    return NextResponse.json(
      {
        error: 'Error al obtener evento',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/calendar/events/[id]
 * Actualizar un evento
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    // Convertir strings de fecha a Date objects
    if (body.date && typeof body.date === 'string') {
      body.date = new Date(body.date);
    }
    if (body.endDate && typeof body.endDate === 'string') {
      body.endDate = new Date(body.endDate);
    }

    // Validar datos
    const validatedData = CalendarEventUpdateSchema.parse(body);

    // Verificar que el evento existe
    const existingEvent = await CalendarService.getEventById(id);
    if (!existingEvent) {
      return NextResponse.json(
        { error: 'Evento no encontrado' },
        { status: 404 }
      );
    }

    // Actualizar evento
    const updateData: CalendarEventUpdateData = {
      title: validatedData.title,
      description: validatedData.description,
      date: validatedData.date,
      endDate: validatedData.endDate,
      status: validatedData.status,
      priority: validatedData.priority,
      responsibleUserId: validatedData.responsibleUserId,
      responsibleUserName: validatedData.responsibleUserName,
      participantIds: validatedData.participantIds,
      processId: validatedData.processId,
      processName: validatedData.processName,
      metadata: validatedData.metadata,
      notificationSchedule: validatedData.notificationSchedule,
    };

    await CalendarService.updateEvent(id, updateData);

    return NextResponse.json({ message: 'Evento actualizado exitosamente' });
  } catch (error) {
    console.error('Error in PATCH /api/calendar/events/[id]:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Error al actualizar evento',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/calendar/events/[id]
 * Eliminar un evento (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Verificar que el evento existe
    const existingEvent = await CalendarService.getEventById(id);
    if (!existingEvent) {
      return NextResponse.json(
        { error: 'Evento no encontrado' },
        { status: 404 }
      );
    }

    await CalendarService.deleteEvent(id);

    return NextResponse.json({ message: 'Evento eliminado exitosamente' });
  } catch (error) {
    console.error('Error in DELETE /api/calendar/events/[id]:', error);
    return NextResponse.json(
      {
        error: 'Error al eliminar evento',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
