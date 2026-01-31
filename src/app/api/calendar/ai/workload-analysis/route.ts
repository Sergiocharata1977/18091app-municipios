import { aiRateLimiter } from '@/lib/rate-limiter';
import { CalendarService } from '@/services/calendar/CalendarService';
import type {
  WorkloadAnalysisQuery,
  WorkloadAnalysisResponse,
} from '@/types/calendar';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/calendar/ai/workload-analysis
 * Analizar carga de trabajo de un usuario
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

    const body = (await request.json()) as WorkloadAnalysisQuery;

    const { userId, period, startDate, compareWithPrevious = false } = body;

    if (!userId || !period) {
      return NextResponse.json(
        { error: 'userId y period son requeridos' },
        { status: 400 }
      );
    }

    // Obtener carga de trabajo actual
    const currentWorkload = await CalendarService.getUserWorkload(
      userId,
      period,
      startDate ? new Date(startDate) : undefined
    );

    // Obtener carga de trabajo anterior si se solicita
    let previousWorkload;
    if (compareWithPrevious) {
      const previousStart = new Date(currentWorkload.startDate);

      switch (period) {
        case 'week':
          previousStart.setDate(previousStart.getDate() - 7);
          break;
        case 'month':
          previousStart.setMonth(previousStart.getMonth() - 1);
          break;
        case 'quarter':
          previousStart.setMonth(previousStart.getMonth() - 3);
          break;
      }

      previousWorkload = await CalendarService.getUserWorkload(
        userId,
        period,
        previousStart
      );
    }

    // Calcular tendencia
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (previousWorkload) {
      const diff = currentWorkload.totalEvents - previousWorkload.totalEvents;
      const percentChange = (diff / previousWorkload.totalEvents) * 100;

      if (percentChange > 10) trend = 'increasing';
      else if (percentChange < -10) trend = 'decreasing';
    }

    // Generar insights
    const insights: string[] = [];

    if (currentWorkload.overdueEvents > 0) {
      insights.push(
        `Tiene ${currentWorkload.overdueEvents} evento(s) vencido(s) que requieren atención inmediata.`
      );
    }

    if (currentWorkload.averageEventsPerDay > 5) {
      insights.push(
        `Carga de trabajo alta: promedio de ${currentWorkload.averageEventsPerDay.toFixed(1)} eventos por día.`
      );
    }

    if (currentWorkload.completionRate < 50) {
      insights.push(
        `Tasa de completitud baja (${currentWorkload.completionRate.toFixed(0)}%). Considere revisar prioridades.`
      );
    }

    if (currentWorkload.peakDay) {
      insights.push(
        `Día pico: ${currentWorkload.peakDay.date.toLocaleDateString()} con ${currentWorkload.peakDay.count} eventos.`
      );
    }

    const criticalEvents = currentWorkload.byPriority.critical || 0;
    if (criticalEvents > 0) {
      insights.push(
        `${criticalEvents} evento(s) de prioridad crítica requieren atención.`
      );
    }

    // Generar recomendaciones
    const recommendations: string[] = [];

    if (currentWorkload.overdueEvents > 0) {
      recommendations.push(
        'Priorice la resolución de eventos vencidos antes de tomar nuevas tareas.'
      );
    }

    if (currentWorkload.averageEventsPerDay > 5) {
      recommendations.push(
        'Considere delegar o reprogramar eventos no críticos para balancear la carga.'
      );
    }

    if (trend === 'increasing') {
      recommendations.push(
        'La carga de trabajo está aumentando. Planifique tiempo adicional para gestión.'
      );
    }

    if (currentWorkload.completionRate < 70) {
      recommendations.push(
        'Revise los eventos pendientes y actualice su estado para mejorar el seguimiento.'
      );
    }

    if (recommendations.length === 0) {
      recommendations.push(
        'La carga de trabajo está bien balanceada. Continúe con el ritmo actual.'
      );
    }

    const response: WorkloadAnalysisResponse = {
      current: currentWorkload,
      previous: previousWorkload,
      trend,
      insights,
      recommendations,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in workload-analysis API:', error);
    return NextResponse.json(
      { error: 'Error al analizar carga de trabajo' },
      { status: 500 }
    );
  }
}
