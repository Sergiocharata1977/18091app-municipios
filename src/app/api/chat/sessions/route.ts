// API: /api/chat/sessions
// Gestión de sesiones de chat

import { ChatService } from '@/features/chat/services/ChatService';
import { ContextService } from '@/features/chat/services/ContextService';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { NextRequest, NextResponse } from 'next/server';

// Helper para obtener datos del usuario
async function getUserData(userId: string) {
  const db = getAdminFirestore();
  const userDoc = await db.collection('users').doc(userId).get();

  if (!userDoc.exists) {
    return null;
  }

  const data = userDoc.data();
  return {
    id: userDoc.id,
    organizationId: data?.organization_id,
    personnelId: data?.personnel_id,
    role: data?.rol,
  };
}

// GET /api/chat/sessions - Listar sesiones del usuario
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Obtener datos del usuario para validar organizationId
    const user = await getUserData(userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.organizationId) {
      return NextResponse.json(
        { error: 'User has no organization assigned' },
        { status: 403 }
      );
    }

    console.log(
      '[API /chat/sessions] Getting sessions for user:',
      userId,
      'org:',
      user.organizationId
    );

    const sessions = await ChatService.getSessions(
      user.organizationId,
      userId,
      limit
    );

    return NextResponse.json({
      success: true,
      sessions,
      total: sessions.length,
    });
  } catch (error) {
    console.error('[API /chat/sessions] Error:', error);
    return NextResponse.json(
      {
        error: 'Error fetching sessions',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST /api/chat/sessions - Crear nueva sesión
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, type = 'advisor', module } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Obtener datos del usuario
    const user = await getUserData(userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.organizationId) {
      return NextResponse.json(
        {
          error:
            'User has no organization assigned. Please contact administrator.',
        },
        { status: 403 }
      );
    }

    console.log(
      '[API /chat/sessions] Creating session for user:',
      userId,
      'org:',
      user.organizationId
    );

    // Crear sesión
    const session = await ChatService.createSession({
      organizationId: user.organizationId,
      userId,
      personnelId: user.personnelId,
      type,
      module,
    });

    // Obtener contexto para la IA
    const context = await ContextService.getContext(
      user.organizationId,
      userId
    );

    return NextResponse.json({
      success: true,
      session,
      context,
    });
  } catch (error) {
    console.error('[API /chat/sessions] Error:', error);
    return NextResponse.json(
      {
        error: 'Error creating session',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/chat/sessions - Eliminar sesión
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const userId = searchParams.get('userId');

    if (!sessionId || !userId) {
      return NextResponse.json(
        { error: 'sessionId and userId are required' },
        { status: 400 }
      );
    }

    // Obtener datos del usuario
    const user = await getUserData(userId);

    if (!user || !user.organizationId) {
      return NextResponse.json(
        { error: 'User not found or has no organization' },
        { status: 404 }
      );
    }

    console.log('[API /chat/sessions] Deleting session:', sessionId);

    await ChatService.deleteSession(sessionId, user.organizationId);

    return NextResponse.json({
      success: true,
      message: 'Session deleted successfully',
    });
  } catch (error) {
    console.error('[API /chat/sessions] Error:', error);
    return NextResponse.json(
      {
        error: 'Error deleting session',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
