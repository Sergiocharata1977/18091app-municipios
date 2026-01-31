import { getAdminAuth } from '@/lib/firebase/admin';
import { createReactionSchema } from '@/lib/validations/news';
import { PostService } from '@/services/news/PostService';
import { ReactionService } from '@/services/news/ReactionService';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/news/posts/[id]/reactions - Toggle reacción en post
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

    // Verificar que el post existe
    const post = await PostService.getById(params.id);
    if (!post) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'POST_NOT_FOUND',
            message: 'Publicación no encontrada',
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
      'post',
      params.id,
      userId,
      userName,
      validationResult.data.type
    );

    // TODO: Crear notificación para el autor del post si se agregó reacción (Fase 2)
    // if (result.reacted && post.authorId !== userId) {
    //   await NotificationService.create({
    //     userId: post.authorId,
    //     type: 'reaction',
    //     postId: params.id,
    //     commentId: null,
    //     actorId: userId,
    //     actorName: userName,
    //     actorPhotoURL: userRecord.photoURL || null,
    //     message: `A ${userName} le gustó tu publicación`,
    //   });
    // }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error in POST /api/news/posts/[id]/reactions:', error);
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
