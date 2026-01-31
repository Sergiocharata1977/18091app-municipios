/**
 * API para obtener mensajes de una conversación
 * GET /api/whatsapp/messages/[conversationId]
 */

import { getMessages } from '@/services/whatsapp';
import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: {
    conversationId: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { conversationId } = params;
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');

    if (!conversationId) {
      return NextResponse.json(
        {
          success: false,
          error: 'conversationId es requerido',
        },
        { status: 400 }
      );
    }

    const messages = await getMessages(conversationId, {
      limit: limit ? parseInt(limit) : 50,
    });

    return NextResponse.json({
      success: true,
      data: messages,
      count: messages.length,
    });
  } catch (error: any) {
    console.error('[API /whatsapp/messages] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error interno del servidor',
      },
      { status: 500 }
    );
  }
}
