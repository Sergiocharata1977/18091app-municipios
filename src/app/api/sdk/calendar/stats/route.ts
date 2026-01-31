/**
 * Calendar Statistics API Route - SDK Unified
 *
 * GET /api/sdk/calendar/stats - Get calendar statistics
 */

import { CalendarService } from '@/lib/sdk/modules/calendar';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const service = new CalendarService();
    const stats = await service.getStats();

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error in GET /api/sdk/calendar/stats:', error);
    return NextResponse.json(
      {
        error: 'Error al obtener estadísticas de calendario',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
