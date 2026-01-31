import { aiRateLimiter } from '@/lib/rate-limiter';
import { CalendarService } from '@/services/calendar/CalendarService';
import type { EventContextQuery } from '@/types/calendar';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/calendar/ai/event-context
 * Obtener contexto completo de un evento
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimit = aiRateLimiter.check(identifier);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Demasiadas solicitudes. Intente nuevamente más tarde.',
          resetAt: new Date(rateLimit.resetAt).toISOString(),
        },
        { status: 429 }
      );
    }

    const body = (await request.json()) as EventContextQuery;

    const {
      eventId,
      includeSourceRecord = true,
      includeRelatedRecords = true,
      includeUserDetails = true,
      includeProcessDetails = true,
    } = body;

    if (!eventId) {
      return NextResponse.json(
        { error: 'eventId es requerido' },
        { status: 400 }
      );
    }

    // Obtener contexto del evento
    const context = await CalendarService.getEventContext(
      eventId,
      includeSourceRecord,
      includeRelatedRecords
    );

    if (!context) {
      return NextResponse.json(
        { error: 'Evento no encontrado' },
        { status: 404 }
      );
    }

    // Filtrar información según flags
    if (!includeUserDetails) {
      context.responsibleUser = null;
      context.participants = null;
    }

    if (!includeProcessDetails) {
      context.process = null;
    }

    return NextResponse.json(context);
  } catch (error) {
    console.error('Error in event-context API:', error);
    return NextResponse.json(
      { error: 'Error al obtener contexto del evento' },
      { status: 500 }
    );
  }
}
