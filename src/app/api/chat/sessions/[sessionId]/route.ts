// API: /api/chat/sessions/[sessionId]
// Operaciones sobre una sesión específica

import { ChatService } from '@/features/chat/services/ChatService';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { NextRequest, NextResponse } from 'next/server';

// Helper para obtener organizationId del usuario
async function getOrganizationId(userId: string): Promise<string | null> {
  const db = getAdminFirestore();
  const userDoc = await db.collection('users').doc(userId).get();

  if (!userDoc.exists) {
    return null;
  }

  return userDoc.data()?.organization_id || null;
}

// GET /api/chat/sessions/[sessionId] - Obtener sesión con mensajes
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const organizationId = await getOrganizationId(userId);

    if (!organizationId) {
      return NextResponse.json(
        { error: 'User has no organization assigned' },
        { status: 403 }
      );
    }

    console.log('[API /chat/sessions/:id] Getting session:', sessionId);

    // Obtener sesión (valida organización internamente)
    const session = await ChatService.getSession(sessionId, organizationId);

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Obtener mensajes
    const messages = await ChatService.getMessages(sessionId, organizationId);

    return NextResponse.json({
      success: true,
      session,
      messages,
    });
  } catch (error) {
    console.error('[API /chat/sessions/:id] Error:', error);

    // Check for access denied error
    if (error instanceof Error && error.message.includes('Access denied')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json(
      {
        error: 'Error fetching session',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// PATCH /api/chat/sessions/[sessionId] - Actualizar sesión
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const body = await request.json();
    const { userId, title, status, tags } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const organizationId = await getOrganizationId(userId);

    if (!organizationId) {
      return NextResponse.json(
        { error: 'User has no organization assigned' },
        { status: 403 }
      );
    }

    console.log('[API /chat/sessions/:id] Updating session:', sessionId);

    await ChatService.updateSession(sessionId, organizationId, {
      title,
      status,
      tags,
    });

    return NextResponse.json({
      success: true,
      message: 'Session updated successfully',
    });
  } catch (error) {
    console.error('[API /chat/sessions/:id] Error:', error);
    return NextResponse.json(
      {
        error: 'Error updating session',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/chat/sessions/[sessionId] - Eliminar sesión
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const organizationId = await getOrganizationId(userId);

    if (!organizationId) {
      return NextResponse.json(
        { error: 'User has no organization assigned' },
        { status: 403 }
      );
    }

    console.log('[API /chat/sessions/:id] Deleting session:', sessionId);

    await ChatService.deleteSession(sessionId, organizationId);

    return NextResponse.json({
      success: true,
      message: 'Session deleted successfully',
    });
  } catch (error) {
    console.error('[API /chat/sessions/:id] Error:', error);
    return NextResponse.json(
      {
        error: 'Error deleting session',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
