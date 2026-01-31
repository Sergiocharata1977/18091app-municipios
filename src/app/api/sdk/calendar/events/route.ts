/**
 * Calendar Events API Routes - SDK Unified
 *
 * GET /api/sdk/calendar/events - List calendar events
 * POST /api/sdk/calendar/events - Create calendar event
 */

import { NextRequest, NextResponse } from 'next/server';
import { CalendarService } from '@/lib/sdk/modules/calendar';
import { CreateCalendarEventSchema } from '@/lib/sdk/modules/calendar/validations';
import type { CalendarEventFilters } from '@/lib/sdk/modules/calendar/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const filters: CalendarEventFilters = {
      eventType: (searchParams.get('eventType') as any) || undefined,
      status: (searchParams.get('status') as any) || undefined,
      relatedModule: searchParams.get('relatedModule') || undefined,
      userId: searchParams.get('userId') || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      search: searchParams.get('search') || undefined,
    };

    const options = {
      limit: searchParams.get('limit')
        ? parseInt(searchParams.get('limit')!)
        : 100,
      offset: searchParams.get('offset')
        ? parseInt(searchParams.get('offset')!)
        : 0,
    };

    const service = new CalendarService();
    const events = await service.list(filters, options);

    return NextResponse.json({ events, count: events.length });
  } catch (error) {
    console.error('Error in GET /api/sdk/calendar/events:', error);
    return NextResponse.json(
      {
        error: 'Error al obtener eventos',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validatedData = CreateCalendarEventSchema.parse(body);
    const userId = body.userId || 'system';

    const service = new CalendarService();
    const eventId = await service.createAndReturnId(validatedData, userId);

    return NextResponse.json(
      { id: eventId, message: 'Evento creado exitosamente' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/sdk/calendar/events:', error);
    return NextResponse.json(
      {
        error: 'Error al crear evento',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
