/**
 * Post Comments API Route - SDK Unified
 *
 * POST /api/sdk/news/posts/[id]/comments - Create comment
 */

import { NextRequest, NextResponse } from 'next/server';
import { CommentService } from '@/lib/sdk/modules/news';
import { CreateCommentSchema } from '@/lib/sdk/modules/news/validations';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'ID de post requerido' },
        { status: 400 }
      );
    }

    const validatedData = CreateCommentSchema.parse(body);
    const userId = body.userId || 'system';

    const service = new CommentService();
    const commentId = await service.createAndReturnId(validatedData, userId);

    return NextResponse.json(
      { id: commentId, message: 'Comentario creado exitosamente' },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      `Error in POST /api/sdk/news/posts/${params.id}/comments:`,
      error
    );
    return NextResponse.json(
      {
        error: 'Error al crear comentario',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
