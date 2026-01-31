import { CalendarService } from '@/services/calendar/CalendarService';
import { EventFilters } from '@/types/calendar';
import { NextRequest, NextResponse } from 'next/server';

// Forzar renderizado dinámico para evitar error en build
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Obtener parámetros de filtro
    const organizationId = searchParams.get('organizationId');
    const type = searchParams.get('type');
    const sourceModule = searchParams.get('sourceModule');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId es requerido' },
        { status: 400 }
      );
    }

    // Construir filtros
    const filters: EventFilters = {};
    if (type) filters.type = type as EventFilters['type'];
    if (sourceModule)
      filters.sourceModule = sourceModule as EventFilters['sourceModule'];
    if (status) filters.status = status as EventFilters['status'];

    // Obtener eventos
    let events;
    if (startDate && endDate) {
      events = await CalendarService.getEventsByDateRange(
        new Date(startDate),
        new Date(endDate),
        filters,
        organizationId
      );
    } else {
      // Por defecto, últimos 3 meses
      const end = new Date();
      const start = new Date();
      start.setMonth(start.getMonth() - 3);
      events = await CalendarService.getEventsByDateRange(
        start,
        end,
        filters,
        organizationId
      );
    }

    // Generar iCalendar
    const icalContent = CalendarService.generateICalendar(
      events,
      'Calendario Sistema de Gestión'
    );

    // Retornar como archivo descargable
    return new NextResponse(icalContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="calendario.ics"',
      },
    });
  } catch (error) {
    console.error('Error exporting iCalendar:', error);
    return NextResponse.json(
      { error: 'Error al exportar calendario' },
      { status: 500 }
    );
  }
}
