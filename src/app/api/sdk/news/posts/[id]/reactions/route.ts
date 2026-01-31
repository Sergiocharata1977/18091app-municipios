/**
 * Post Reactions API Route - SDK Unified
 *
 * POST /api/sdk/news/posts/[id]/reactions - Toggle reaction
 */

import { NextRequest, NextResponse } from 'next/server';
import { ReactionService } from '@/lib/sdk/modules/news';

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

    const { reactionType } = body;
    if (!reactionType) {
      return NextResponse.json(
        { error: 'Tipo de reacción requerido' },
        { status: 400 }
      );
    }

    const userId = body.userId || 'system';

    const service = new ReactionService();
    await service.toggle(id, userId, reactionType);

    return NextResponse.json(
      { message: 'Reacción toggled exitosamente', postId: id, reactionType },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      `Error in POST /api/sdk/news/posts/${params.id}/reactions:`,
      error
    );
    return NextResponse.json(
      {
        error: 'Error al crear reacción',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
