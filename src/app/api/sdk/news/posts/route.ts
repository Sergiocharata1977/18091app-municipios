/**
 * News Posts API Routes - SDK Unified
 *
 * GET /api/sdk/news/posts - List posts
 * POST /api/sdk/news/posts - Create post
 */

import { NextRequest, NextResponse } from 'next/server';
import { PostService } from '@/lib/sdk/modules/news';
import { CreatePostSchema } from '@/lib/sdk/modules/news/validations';
import type { PostFilters } from '@/lib/sdk/modules/news/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const filters: PostFilters = {
      author: searchParams.get('author') || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      tags: searchParams.get('tags')
        ? searchParams.get('tags')!.split(',')
        : undefined,
      search: searchParams.get('search') || undefined,
    };

    const options = {
      limit: searchParams.get('limit')
        ? parseInt(searchParams.get('limit')!)
        : 100,
      offset: searchParams.get('offset')
        ? parseInt(searchParams.get('offset')!)
        : 0,
    };

    const service = new PostService();
    const posts = await service.list(filters, options);

    return NextResponse.json({ posts, count: posts.length });
  } catch (error) {
    console.error('Error in GET /api/sdk/news/posts:', error);
    return NextResponse.json(
      {
        error: 'Error al obtener posts',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validatedData = CreatePostSchema.parse(body);
    const userId = body.userId || 'system';

    const service = new PostService();
    const postId = await service.createAndReturnId(validatedData, userId);

    return NextResponse.json(
      { id: postId, message: 'Post creado exitosamente' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/sdk/news/posts:', error);
    return NextResponse.json(
      {
        error: 'Error al crear post',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
