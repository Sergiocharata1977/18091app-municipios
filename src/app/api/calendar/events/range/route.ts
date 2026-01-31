import { adminDb } from '@/firebase/admin';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface CalendarEvent {
  id: string;
  isActive?: boolean;
  organizationId?: string;
  date?: any;
  endDate?: any;
  createdAt?: any;
  updatedAt?: any;
  [key: string]: any;
}

/**
 * GET /api/calendar/events/range
 * Obtener eventos por rango de fechas usando Admin SDK
 * Requiere: startDate, endDate, organizationId
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');
    const organizationId = searchParams.get('organizationId');

    if (!startDateStr || !endDateStr) {
      return NextResponse.json(
        { error: 'startDate y endDate son requeridos' },
        { status: 400 }
      );
    }

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json({ error: 'Fechas inválidas' }, { status: 400 });
    }

    console.log('[Calendar API] Fetching events...');

    // Obtener todos los eventos activos (sin filtrar por org temporalmente)
    // TODO: Agregar filtro por organizationId cuando todos los datos estén estandarizados
    const allEventsSnapshot = await adminDb
      .collection('calendar_events')
      .where('isActive', '==', true)
      .get();

    console.log('[Calendar API] Total active events:', allEventsSnapshot.size);

    // Mapear documentos a eventos con tipos correctos
    const allEvents: CalendarEvent[] = allEventsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
      } as CalendarEvent;
    });

    // Filtrar eventos activos
    const activeEvents = allEvents.filter(e => e.isActive === true);

    // Convertir fechas y filtrar por rango
    const eventsInRange = activeEvents
      .map(event => {
        let eventDate: Date;
        const rawDate = event.date;

        if (rawDate?.toDate) {
          eventDate = rawDate.toDate();
        } else if (rawDate?._seconds) {
          eventDate = new Date(rawDate._seconds * 1000);
        } else if (rawDate instanceof Date) {
          eventDate = rawDate;
        } else if (typeof rawDate === 'string') {
          eventDate = new Date(rawDate);
        } else {
          eventDate = new Date(0);
        }

        return {
          ...event,
          date: eventDate,
          endDate: event.endDate?.toDate?.() || event.endDate,
          createdAt: event.createdAt?.toDate?.() || event.createdAt,
          updatedAt: event.updatedAt?.toDate?.() || event.updatedAt,
        };
      })
      .filter(event => {
        const eventDate =
          event.date instanceof Date ? event.date : new Date(event.date as any);
        return eventDate >= startDate && eventDate <= endDate;
      })
      .sort((a, b) => {
        const dateA = a.date instanceof Date ? a.date : new Date(a.date as any);
        const dateB = b.date instanceof Date ? b.date : new Date(b.date as any);
        return dateA.getTime() - dateB.getTime();
      });

    console.log('[Calendar API] Events in range:', eventsInRange.length);

    return NextResponse.json({
      events: eventsInRange,
      count: eventsInRange.length,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
  } catch (error: any) {
    console.error('[Calendar API] Error:', error);

    return NextResponse.json(
      {
        error: 'Error al obtener eventos',
        details: error?.message || 'Unknown error',
        code: error?.code || 'UNKNOWN',
      },
      { status: 500 }
    );
  }
}
