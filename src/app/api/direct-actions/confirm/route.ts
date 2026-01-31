// API endpoint for confirming direct actions

import { NextRequest, NextResponse } from 'next/server';
import { DirectActionService } from '@/services/direct-actions';
import { errorLogger, ErrorSeverity } from '@/lib/utils/ErrorLogger';

interface ConfirmActionRequest {
  actionId: string;
  userId: string;
  confirmed: boolean;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body: ConfirmActionRequest = await request.json();
    const { actionId, userId, confirmed } = body;

    // Validate required parameters
    if (!actionId || !userId) {
      return NextResponse.json(
        {
          error: 'Parámetros requeridos faltantes',
          details: {
            actionId: !actionId ? 'requerido' : 'ok',
            userId: !userId ? 'requerido' : 'ok',
          },
        },
        { status: 400 }
      );
    }

    console.log('[API /direct-actions/confirm] Processing confirmation:', {
      actionId,
      userId,
      confirmed,
    });

    // Execute the action
    const result = await DirectActionService.confirmAndExecuteAction(
      actionId,
      userId,
      confirmed
    );

    console.log('[API /direct-actions/confirm] Action completed:', {
      actionId,
      success: result.success,
      tiempo_respuesta_ms: Date.now() - startTime,
    });

    return NextResponse.json({
      success: result.success,
      message: result.message,
      data: result.data,
      tiempo_respuesta_ms: Date.now() - startTime,
    });
  } catch (error) {
    const tiempo_respuesta_ms = Date.now() - startTime;

    errorLogger.logError(
      error as Error,
      {
        operation: 'direct_action_confirm',
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
