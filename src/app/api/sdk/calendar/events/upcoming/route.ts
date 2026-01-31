/**
 * Upcoming Calendar Events API Route - SDK Unified
 *
 * GET /api/sdk/calendar/events/upcoming - Get upcoming events
 */

import { CalendarService } from '@/lib/sdk/modules/calendar';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const days = searchParams.get('days')
      ? parseInt(searchParams.get('days')!)
      : 7;

    const service = new CalendarService();
    const events = await service.getUpcoming(days);

    return NextResponse.json({ events, count: events.length });
  } catch (error) {
    console.error('Error in GET /api/sdk/calendar/events/upcoming:', error);
    return NextResponse.json(
      {
        error: 'Error al obtener eventos próximos',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
