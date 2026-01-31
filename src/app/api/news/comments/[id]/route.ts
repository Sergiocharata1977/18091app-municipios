import { getAdminAuth, getAdminFirestore } from '@/lib/firebase/admin';
import { updateCommentSchema } from '@/lib/validations/news';
import { NextRequest, NextResponse } from 'next/server';

const COMMENTS_COLLECTION = 'news_comments';
const POSTS_COLLECTION = 'news_posts';

// PATCH /api/news/comments/[id] - Actualizar comentario
export async function PATCH(
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

    // Usar Admin Firestore
    const db = getAdminFirestore();
    const commentRef = db.collection(COMMENTS_COLLECTION).doc(params.id);
    const commentDoc = await commentRef.get();

    if (!commentDoc.exists) {
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

    const commentData = commentDoc.data();

    // Verificar permisos (solo el autor puede editar)
    if (commentData?.authorId !== userId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'No tienes permisos para editar este comentario',
          },
        },
        { status: 403 }
      );
    }

    // Obtener datos del body
    const body = await request.json();

    // Validar datos
    const validationResult = updateCommentSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_COMMENT_DATA',
            message: 'Datos de comentario inválidos',
            details: validationResult.error.issues,
          },
        },
        { status: 400 }
      );
    }

    // Actualizar comentario
    await commentRef.update({
      content: validationResult.data.content,
      isEdited: true,
      updatedAt: new Date(),
    });

    // Obtener comentario actualizado
    const updatedDoc = await commentRef.get();
    const updatedComment = {
      id: updatedDoc.id,
      ...updatedDoc.data(),
    };

    return NextResponse.json({
      success: true,
      data: updatedComment,
    });
  } catch (error) {
    console.error('Error in PATCH /api/news/comments/[id]:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Error al actualizar comentario',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}

// DELETE /api/news/comments/[id] - Eliminar comentario
export async function DELETE(
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

    // Usar Admin Firestore
    const db = getAdminFirestore();
    const commentRef = db.collection(COMMENTS_COLLECTION).doc(params.id);
    const commentDoc = await commentRef.get();

    if (!commentDoc.exists) {
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

    const commentData = commentDoc.data();

    // Verificar permisos (autor o admin)
    const isAdmin = decodedToken.role === 'admin';
    const isAuthor = commentData?.authorId === userId;

    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'No tienes permisos para eliminar este comentario',
          },
        },
        { status: 403 }
      );
    }

    // Eliminar comentario (soft delete)
    await commentRef.update({
      isActive: false,
      updatedAt: new Date(),
    });

    // Decrementar contador de comentarios del post
    const postId = commentData?.postId;
    if (postId) {
      const postRef = db.collection(POSTS_COLLECTION).doc(postId);
      const postDoc = await postRef.get();
      if (postDoc.exists) {
        const currentCount = postDoc.data()?.commentCount || 0;
        await postRef.update({
          commentCount: Math.max(0, currentCount - 1),
        });
      }
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Error in DELETE /api/news/comments/[id]:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Error al eliminar comentario',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}
