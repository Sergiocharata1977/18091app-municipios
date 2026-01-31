import {
  CalendarEventSchema,
  EventFiltersSchema,
} from '@/lib/validations/calendar';
import { CalendarService } from '@/services/calendar/CalendarService';
import type { CalendarEventCreateData } from '@/types/calendar';
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';

/**
 * GET /api/calendar/events
 * Obtener eventos de calendario con filtros
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Obtener parámetros de query
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');
    const organizationId = searchParams.get('organizationId');

    // Construir filtros
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

    let events;

    // Si hay rango de fechas, usar getEventsByDateRange
    if (startDateStr && endDateStr) {
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return NextResponse.json(
          { error: 'Fechas inválidas' },
          { status: 400 }
        );
      }

      events = await CalendarService.getEventsByDateRange(
        startDate,
        endDate,
        validatedFilters,
        organizationId || undefined
      );
    }
    // Si hay responsibleUserId, usar getEventsByUser
    else if (responsibleUserId) {
      events = await CalendarService.getEventsByUser(
        responsibleUserId,
        validatedFilters,
        organizationId || undefined
      );
    }
    // Si hay sourceModule, usar getEventsByModule
    else if (
      sourceModule &&
      typeof sourceModule === 'string' &&
      !sourceModule.includes(',')
    ) {
      events = await CalendarService.getEventsByModule(
        sourceModule,
        validatedFilters,
        organizationId || undefined
      );
    }
    // Por defecto, obtener próximos 30 días
    else {
      events = await CalendarService.getUpcomingEvents(
        30,
        validatedFilters,
        organizationId || undefined
      );
    }

    return NextResponse.json({ events });
  } catch (error) {
    console.error('Error in GET /api/calendar/events:', error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Filtros inválidos', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Error al obtener eventos',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/calendar/events
 * Crear un nuevo evento de calendario
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Convertir strings de fecha a Date objects
    if (body.date && typeof body.date === 'string') {
      body.date = new Date(body.date);
    }
    if (body.endDate && typeof body.endDate === 'string') {
      body.endDate = new Date(body.endDate);
    }

    // Validar datos
    const validatedData = CalendarEventSchema.parse(body);

    // Crear evento
    const eventData: CalendarEventCreateData = {
      title: validatedData.title,
      description: validatedData.description,
      date: validatedData.date,
      endDate: validatedData.endDate,
      type: validatedData.type,
      sourceModule: validatedData.sourceModule,
      priority: validatedData.priority,
      sourceRecordId: validatedData.sourceRecordId,
      sourceRecordType: validatedData.sourceRecordType,
      sourceRecordNumber: validatedData.sourceRecordNumber,
      responsibleUserId: validatedData.responsibleUserId,
      responsibleUserName: validatedData.responsibleUserName,
      participantIds: validatedData.participantIds,
      organizationId: validatedData.organizationId,
      processId: validatedData.processId,
      processName: validatedData.processName,
      metadata: validatedData.metadata,
      notificationSchedule: validatedData.notificationSchedule,
      isRecurring: validatedData.isRecurring,
      recurrenceRule: validatedData.recurrenceRule,
      createdBy: validatedData.createdBy,
      createdByName: validatedData.createdByName,
      isSystemGenerated: validatedData.isSystemGenerated,
    };

    const eventId = await CalendarService.createEvent(eventData);

    return NextResponse.json(
      { id: eventId, message: 'Evento creado exitosamente' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/calendar/events:', error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Error al crear evento',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
