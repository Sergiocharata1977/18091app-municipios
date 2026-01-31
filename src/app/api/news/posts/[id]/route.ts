import { getAdminAuth, getAdminFirestore } from '@/lib/firebase/admin';
import { updatePostSchema } from '@/lib/validations/news';
import { NextRequest, NextResponse } from 'next/server';

const COLLECTION_NAME = 'news_posts';

// GET /api/news/posts/[id] - Obtener post por ID
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
    const docRef = db.collection(COLLECTION_NAME).doc(params.id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
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

    const post = {
      id: docSnap.id,
      ...docSnap.data(),
    };

    return NextResponse.json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error('Error in GET /api/news/posts/[id]:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Error al obtener publicación',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}

// PATCH /api/news/posts/[id] - Actualizar post
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
    const docRef = db.collection(COLLECTION_NAME).doc(params.id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
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

    const postData = docSnap.data();

    // Verificar permisos (solo el autor puede editar)
    if (postData?.authorId !== userId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'No tienes permisos para editar esta publicación',
          },
        },
        { status: 403 }
      );
    }

    // Obtener datos del body
    const body = await request.json();

    // Validar datos
    const validationResult = updatePostSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_POST_DATA',
            message: 'Datos de publicación inválidos',
            details: validationResult.error.issues,
          },
        },
        { status: 400 }
      );
    }

    // Actualizar post
    await docRef.update({
      content: validationResult.data.content,
      isEdited: true,
      editedAt: new Date(),
      updatedAt: new Date(),
    });

    // Obtener post actualizado
    const updatedDocSnap = await docRef.get();
    const updatedPost = {
      id: updatedDocSnap.id,
      ...updatedDocSnap.data(),
    };

    return NextResponse.json({
      success: true,
      data: updatedPost,
    });
  } catch (error) {
    console.error('Error in PATCH /api/news/posts/[id]:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Error al actualizar publicación',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}

// DELETE /api/news/posts/[id] - Eliminar post
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
    const docRef = db.collection(COLLECTION_NAME).doc(params.id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
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

    const postData = docSnap.data();

    // Verificar permisos (autor o admin)
    const isAdmin = decodedToken.role === 'admin';
    const isAuthor = postData?.authorId === userId;

    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'No tienes permisos para eliminar esta publicación',
          },
        },
        { status: 403 }
      );
    }

    // Eliminar post (soft delete - marcar como inactivo)
    await docRef.update({
      isActive: false,
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Error in DELETE /api/news/posts/[id]:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Error al eliminar publicación',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}
