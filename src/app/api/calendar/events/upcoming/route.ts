import { EventFiltersSchema } from '@/lib/validations/calendar';
import { CalendarService } from '@/services/calendar/CalendarService';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/calendar/events/upcoming
 * Obtener eventos próximos (N días)
 * Query params: days (default: 7), organizationId, + filtros opcionales
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parámetros
    const daysStr = searchParams.get('days');
    const days: number = daysStr ? parseInt(daysStr, 10) : 7;
    const organizationId = searchParams.get('organizationId');

    if (isNaN(days) || days < 1 || days > 365) {
      return NextResponse.json(
        { error: 'El parámetro days debe ser un número entre 1 y 365' },
        { status: 400 }
      );
    }

    // Construir filtros opcionales
    const filters: Record<string, unknown> = {};

    const type = searchParams.get('type');
    if (type) {
      filters.type = type.includes(',') ? type.split(',') : type;
    }

    const sourceModule = searchParams.get('sourceModule');
    if (sourceModule) {
      filters.sourceModule = sourceModule.includes(',')
        ? sourceModule.split(',')
        : sourceModule;
    }

    const status = searchParams.get('status');
    if (status) {
      filters.status = status.includes(',') ? status.split(',') : status;
    }

    const priority = searchParams.get('priority');
    if (priority) {
      filters.priority = priority.includes(',')
        ? priority.split(',')
        : priority;
    }

    const responsibleUserId = searchParams.get('responsibleUserId');
    if (responsibleUserId) {
      filters.responsibleUserId = responsibleUserId;
    }

    const processId = searchParams.get('processId');
    if (processId) {
      filters.processId = processId;
    }

    const isSystemGenerated = searchParams.get('isSystemGenerated');
    if (isSystemGenerated !== null) {
      filters.isSystemGenerated = isSystemGenerated === 'true';
    }

    const search = searchParams.get('search');
    if (search) {
      filters.search = search;
    }

    // Validar filtros
    const validatedFilters = EventFiltersSchema.parse(filters);

    // Obtener eventos próximos
    const events = await CalendarService.getUpcomingEvents(
      days,
      validatedFilters,
      organizationId || undefined
    );

    return NextResponse.json({
      events,
      count: events.length,
      days,
    });
  } catch (error) {
    console.error('Error in GET /api/calendar/events/upcoming:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Filtros inválidos', details: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Error al obtener eventos próximos',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
