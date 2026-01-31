import { getAdminAuth } from '@/lib/firebase/admin';
import { createReactionSchema } from '@/lib/validations/news';
import { CommentService } from '@/services/news/CommentService';
import { ReactionService } from '@/services/news/ReactionService';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/news/comments/[id]/reactions - Toggle reacción en comentario
export async function POST(
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

    // Verificar que el comentario existe
    const comment = await CommentService.getById(params.id);
    if (!comment) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'COMMENT_NOT_FOUND',
            message: 'Comentario no encontrado',
          },
        },
        { status: 404 }
      );
    }

    // Obtener datos del body
    const body = await request.json();

    // Validar datos
    const validationResult = createReactionSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_POST_DATA',
            message: 'Datos de reacción inválidos',
            details: validationResult.error.issues,
          },
        },
        { status: 400 }
      );
    }

    // Obtener información del usuario
    const userRecord = await auth.getUser(userId);
    const userName = userRecord.displayName || 'Usuario';

    // Toggle reacción
    const result = await ReactionService.toggleReaction(
      'comment',
      params.id,
      userId,
      userName,
      validationResult.data.type
    );

    // TODO: Crear notificación para el autor del comentario si se agregó reacción (Fase 2)

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error in POST /api/news/comments/[id]/reactions:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Error al procesar reacción',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}
