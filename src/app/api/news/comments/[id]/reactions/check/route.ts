import { getAdminAuth } from '@/lib/firebase/admin';
import { ReactionService } from '@/services/news/ReactionService';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/news/comments/[id]/reactions/check - Verificar si el usuario actual reaccionó
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'No autorizado' },
        },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    const auth = getAdminAuth();
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Verificar si el usuario reaccionó
    const reacted = await ReactionService.hasUserReacted(
      'comment',
      params.id,
      userId
    );

    return NextResponse.json({
      success: true,
      data: { reacted },
    });
  } catch (error) {
    console.error(
      'Error in GET /api/news/comments/[id]/reactions/check:',
      error
    );
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Error al verificar reacción',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}
