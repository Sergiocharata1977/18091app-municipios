import { getAdminAuth, getAdminFirestore } from '@/lib/firebase/admin';
import {
  createPostSchema,
  paginationSchema,
  postFiltersSchema,
} from '@/lib/validations/news';
import type { Post } from '@/types/news';
import { NextRequest, NextResponse } from 'next/server';

const COLLECTION_NAME = 'news_posts';

// GET /api/news/posts - Listar posts con paginación (usando Admin SDK)
export async function GET(request: NextRequest) {
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

    try {
      await auth.verifyIdToken(token);
    } catch (authError) {
      console.error('Token verification failed:', authError);
      return NextResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Token inválido o expirado' },
        },
        { status: 401 }
      );
    }

    // Obtener parámetros de query
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const authorId = searchParams.get('authorId') || undefined;
    const search = searchParams.get('search') || undefined;

    // Validar paginación
    const paginationResult = paginationSchema.safeParse({ page, limit });
    if (!paginationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_POST_DATA',
            message: 'Parámetros de paginación inválidos',
            details: paginationResult.error.issues,
          },
        },
        { status: 400 }
      );
    }

    // Validar filtros
    const filtersResult = postFiltersSchema.safeParse({ authorId, search });
    if (!filtersResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_POST_DATA',
            message: 'Filtros inválidos',
            details: filtersResult.error.issues,
          },
        },
        { status: 400 }
      );
    }

    // Usar Admin Firestore (bypasa reglas de seguridad)
    const db = getAdminFirestore();
    const pageLimit = paginationResult.data.limit;

    // Construir query con Admin SDK
    let queryRef = db
      .collection(COLLECTION_NAME)
      .where('isActive', '==', true)
      .orderBy('createdAt', 'desc')
      .limit(pageLimit + 1);

    // Filtro por autor si se proporciona
    if (filtersResult.data.authorId) {
      queryRef = db
        .collection(COLLECTION_NAME)
        .where('isActive', '==', true)
        .where('authorId', '==', filtersResult.data.authorId)
        .orderBy('createdAt', 'desc')
        .limit(pageLimit + 1);
    }

    const snapshot = await queryRef.get();

    let posts: Post[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Post[];

    // Verificar si hay más resultados
    const hasMore = posts.length > pageLimit;
    if (hasMore) {
      posts = posts.slice(0, pageLimit);
    }

    // Filtro de búsqueda en memoria
    if (filtersResult.data.search) {
      const searchLower = filtersResult.data.search.toLowerCase();
      posts = posts.filter(post =>
        post.content.toLowerCase().includes(searchLower)
      );
    }

    // Obtener total aproximado
    const totalSnapshot = await db
      .collection(COLLECTION_NAME)
      .where('isActive', '==', true)
      .count()
      .get();
    const total = totalSnapshot.data().count;

    return NextResponse.json({
      success: true,
      data: posts,
      pagination: {
        page: paginationResult.data.page,
        limit: paginationResult.data.limit,
        total,
        hasMore,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/news/posts:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Error al obtener publicaciones',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}

// POST /api/news/posts - Crear nuevo post
export async function POST(request: NextRequest) {
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

    // Obtener datos del JSON body
    const body = await request.json();
    const { content, organizationId, images = [] } = body;

    // Validar datos básicos
    const validationResult = createPostSchema.safeParse({
      content,
      organizationId,
    });
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

    // Validar imágenes (máximo 5)
    if (images.length > 5) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'TOO_MANY_IMAGES',
            message: 'Máximo 5 imágenes permitidas',
          },
        },
        { status: 400 }
      );
    }

    // Obtener información del usuario
    const userRecord = await auth.getUser(userId);
    let userName = userRecord.displayName || null;
    const userPhotoURL = userRecord.photoURL || null;

    // Usar Admin Firestore directamente
    const db = getAdminFirestore();
    const now = new Date();

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

    // Crear documento en Firestore usando Admin SDK
    const postData = {
      content: validationResult.data.content,
      images: images, // Ya vienen con las URLs de Storage
      attachments: [],
      authorId: userId,
      authorName: userName,
      authorPhotoURL: userPhotoURL,
      organizationId: validationResult.data.organizationId,
      isEdited: false,
      editedAt: null,
      commentCount: 0,
      reactionCount: 0,
      isModerated: false,
      moderatedBy: null,
      moderatedAt: null,
      moderationReason: null,
      createdAt: now,
      updatedAt: now,
      isActive: true,
    };

    const docRef = await db.collection(COLLECTION_NAME).add(postData);

    // Retornar el post creado
    const createdPost = {
      id: docRef.id,
      ...postData,
    };

    return NextResponse.json(
      {
        success: true,
        data: createdPost,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/news/posts:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Error al crear publicación',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}
