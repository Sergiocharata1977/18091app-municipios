import { getAdminAuth, getAdminFirestore } from '@/lib/firebase/admin';
import { createCommentSchema } from '@/lib/validations/news';
import { NextRequest, NextResponse } from 'next/server';

const POSTS_COLLECTION = 'news_posts';
const COMMENTS_COLLECTION = 'news_comments';

// GET /api/news/posts/[id]/comments - Obtener comentarios de un post
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
    await auth.verifyIdToken(token);

    // Usar Admin Firestore
    const db = getAdminFirestore();

    // Verificar que el post existe
    const postDoc = await db.collection(POSTS_COLLECTION).doc(params.id).get();
    if (!postDoc.exists) {
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

    // Obtener comentarios ordenados por fecha
    const commentsSnapshot = await db
      .collection(COMMENTS_COLLECTION)
      .where('postId', '==', params.id)
      .where('isActive', '==', true)
      .orderBy('createdAt', 'asc')
      .get();

    const comments = commentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      data: comments,
    });
  } catch (error) {
    console.error('Error in GET /api/news/posts/[id]/comments:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Error al obtener comentarios',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}

// POST /api/news/posts/[id]/comments - Crear comentario
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

    // Usar Admin Firestore
    const db = getAdminFirestore();

    // Verificar que el post existe
    const postRef = db.collection(POSTS_COLLECTION).doc(params.id);
    const postDoc = await postRef.get();
    if (!postDoc.exists) {
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
    const validationResult = createCommentSchema.safeParse(body);
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

    // Obtener información del usuario
    const userRecord = await auth.getUser(userId);
    let userName = userRecord.displayName || null;
    const userPhotoURL = userRecord.photoURL || null;

    // Si no hay displayName en Auth, buscar en Firestore users collection
    if (!userName) {
      const userDoc = await db.collection('users').doc(userId).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        userName =
          userData?.displayName ||
          userData?.name ||
          userData?.email?.split('@')[0] ||
          'Usuario';
      } else {
        userName = userRecord.email?.split('@')[0] || 'Usuario';
      }
    }

    const now = new Date();

    // Crear comentario
    const commentData = {
      postId: params.id,
      content: validationResult.data.content,
      authorId: userId,
      authorName: userName,
      authorPhotoURL: userPhotoURL,
      createdAt: now,
      updatedAt: now,
      isActive: true,
      isEdited: false,
    };

    const commentRef = await db
      .collection(COMMENTS_COLLECTION)
      .add(commentData);

    // Incrementar contador de comentarios del post
    await postRef.update({
      commentCount: (postDoc.data()?.commentCount || 0) + 1,
    });

    // Retornar el comentario creado
    const createdComment = {
      id: commentRef.id,
      ...commentData,
    };

    return NextResponse.json(
      {
        success: true,
        data: createdComment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/news/posts/[id]/comments:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Error al crear comentario',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}
