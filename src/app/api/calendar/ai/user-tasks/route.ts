import { aiRateLimiter } from '@/lib/rate-limiter';
import { CalendarService } from '@/services/calendar/CalendarService';
import type { UserTasksQuery, UserTasksResponse } from '@/types/calendar';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/calendar/ai/user-tasks
 * Obtener tareas pendientes de un usuario
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

    const body = (await request.json()) as UserTasksQuery;

    const {
      userId,
      includeOverdue = true,
      includeUpcoming = true,
      daysAhead = 30,
      groupBy,
    } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId es requerido' },
        { status: 400 }
      );
    }

    // Obtener eventos del usuario
    let tasks = await CalendarService.getEventsByUser(userId);

    // Filtrar por estado (excluir completados y cancelados)
    tasks = tasks.filter(
      e => e.status !== 'completed' && e.status !== 'cancelled'
    );

    // Filtrar por overdue
    const now = new Date();
    const overdueTasks = tasks.filter(
      e => e.date.toDate() < now && e.status !== 'completed'
    );

    // Filtrar por upcoming
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);
    const upcomingTasks = tasks.filter(
      e => e.date.toDate() >= now && e.date.toDate() <= futureDate
    );

    // Combinar según filtros
    let filteredTasks = [];
    if (includeOverdue) filteredTasks.push(...overdueTasks);
    if (includeUpcoming) filteredTasks.push(...upcomingTasks);

    // Eliminar duplicados
    filteredTasks = Array.from(new Set(filteredTasks));

    // Ordenar por fecha
    filteredTasks.sort((a, b) => a.date.toMillis() - b.date.toMillis());

    // Agrupar si se solicita
    let groupedTasks;
    if (groupBy) {
      groupedTasks = filteredTasks.reduce(
        (acc, task) => {
          let key: string;

          switch (groupBy) {
            case 'type':
              key = task.type;
              break;
            case 'priority':
              key = task.priority;
              break;
            case 'module':
              key = task.sourceModule;
              break;
            case 'date':
              key = task.date.toDate().toISOString().split('T')[0];
              break;
            default:
              key = 'other';
          }

          if (!acc[key]) acc[key] = [];
          acc[key].push(task);
          return acc;
        },
        {} as Record<string, typeof filteredTasks>
      );
    }

    const response: UserTasksResponse = {
      userId,
      userName: filteredTasks[0]?.responsibleUserName || 'Usuario',
      totalTasks: filteredTasks.length,
      overdueTasks: overdueTasks.length,
      upcomingTasks: upcomingTasks.length,
      tasks: filteredTasks,
      groupedTasks,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in user-tasks API:', error);
    return NextResponse.json(
      { error: 'Error al obtener tareas del usuario' },
      { status: 500 }
    );
  }
}
