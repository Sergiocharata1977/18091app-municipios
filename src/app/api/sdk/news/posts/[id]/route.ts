/**
 * News Post by ID API Routes - SDK Unified
 *
 * GET /api/sdk/news/posts/[id] - Get post by ID
 * DELETE /api/sdk/news/posts/[id] - Delete post
 */

import { NextRequest, NextResponse } from 'next/server';
import { PostService } from '@/lib/sdk/modules/news';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'ID de post requerido' },
        { status: 400 }
      );
    }

    const service = new PostService();
    const post = await service.getById(id);

    if (!post) {
      return NextResponse.json(
        { error: 'Post no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error(`Error in GET /api/sdk/news/posts/${params.id}:`, error);
    return NextResponse.json(
      {
        error: 'Error al obtener post',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'ID de post requerido' },
        { status: 400 }
      );
    }

    const service = new PostService();
    const post = await service.getById(id);

    if (!post) {
      return NextResponse.json(
        { error: 'Post no encontrado' },
        { status: 404 }
      );
    }

    await service.delete(id);

    return NextResponse.json({
      message: 'Post eliminado exitosamente',
      id,
    });
  } catch (error) {
    console.error(`Error in DELETE /api/sdk/news/posts/${params.id}:`, error);
    return NextResponse.json(
      {
        error: 'Error al eliminar post',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
