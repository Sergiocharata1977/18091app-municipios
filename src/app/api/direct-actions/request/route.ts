// API endpoint for requesting direct actions

import { NextRequest, NextResponse } from 'next/server';
import { DirectActionService } from '@/services/direct-actions';
import { DirectActionRequest } from '@/types/direct-actions';
import { errorLogger, ErrorSeverity } from '@/lib/utils/ErrorLogger';

interface RequestActionBody {
  userId: string;
  sessionId: string;
  action: DirectActionRequest;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body: RequestActionBody = await request.json();
    const { userId, sessionId, action } = body;

    // Validate required parameters
    if (!userId || !sessionId || !action) {
      return NextResponse.json(
        {
          error: 'Parámetros requeridos faltantes',
          details: {
            userId: !userId ? 'requerido' : 'ok',
            sessionId: !sessionId ? 'requerido' : 'ok',
            action: !action ? 'requerido' : 'ok',
          },
        },
        { status: 400 }
      );
    }

    console.log('[API /direct-actions/request] Processing action request:', {
      userId,
      sessionId,
      actionType: action.type,
      entity: action.entity,
    });

    // Create the action request
    const response = await DirectActionService.createActionRequest(
      userId,
      sessionId,
      action
    );

    console.log('[API /direct-actions/request] Action request created:', {
      actionId: response.actionId,
      status: response.status,
      tiempo_respuesta_ms: Date.now() - startTime,
    });

    return NextResponse.json({
      ...response,
      tiempo_respuesta_ms: Date.now() - startTime,
    });
  } catch (error) {
    const tiempo_respuesta_ms = Date.now() - startTime;

    errorLogger.logError(
      error as Error,
      {
        operation: 'direct_action_request',
        metadata: { tiempo_respuesta_ms },
      },
      ErrorSeverity.ERROR
    );

    const userFriendlyMessage = errorLogger.getUserFriendlyMessage(
      error as Error
    );

    return NextResponse.json(
      {
        error: userFriendlyMessage,
        tiempo_respuesta_ms,
      },
      { status: 500 }
    );
  }
}
