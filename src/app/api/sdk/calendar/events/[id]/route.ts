/**
 * Calendar Event by ID API Routes - SDK Unified
 *
 * GET /api/sdk/calendar/events/[id] - Get event by ID
 * PUT /api/sdk/calendar/events/[id] - Update event
 * DELETE /api/sdk/calendar/events/[id] - Delete event
 */

import { NextRequest, NextResponse } from 'next/server';
import { CalendarService } from '@/lib/sdk/modules/calendar';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'ID de evento requerido' },
        { status: 400 }
      );
    }

    const service = new CalendarService();
    const event = await service.getById(id);

    if (!event) {
      return NextResponse.json(
        { error: 'Evento no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ event });
  } catch (error) {
    console.error(`Error in GET /api/sdk/calendar/events/${params.id}:`, error);
    return NextResponse.json(
      {
        error: 'Error al obtener evento',
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
    return NextResponse.json(
      { error: 'Actualización de eventos no implementada' },
      { status: 501 }
    );
  } catch (error) {
    console.error(`Error in PUT /api/sdk/calendar/events/${params.id}:`, error);
    return NextResponse.json(
      {
        error: 'Error al actualizar evento',
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
        { error: 'ID de evento requerido' },
        { status: 400 }
      );
    }

    const service = new CalendarService();
    const event = await service.getById(id);

    if (!event) {
      return NextResponse.json(
        { error: 'Evento no encontrado' },
        { status: 404 }
      );
    }

    await service.delete(id);

    return NextResponse.json({
      message: 'Evento eliminado exitosamente',
      id,
    });
  } catch (error) {
    console.error(
      `Error in DELETE /api/sdk/calendar/events/${params.id}:`,
      error
    );
    return NextResponse.json(
      {
        error: 'Error al eliminar evento',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
