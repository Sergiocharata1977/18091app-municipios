/**
 * NormPoint by Chapter API Route - SDK Unified
 *
 * GET /api/sdk/norm-points/chapter/[chapter] - Get norm points by chapter
 */

import { NextRequest, NextResponse } from 'next/server';
import { NormPointService } from '@/lib/sdk/modules/normPoints';

export async function GET(
  request: NextRequest,
  { params }: { params: { chapter: string } }
) {
  try {
    const { chapter } = params;

    if (!chapter) {
      return NextResponse.json(
        { error: 'Capítulo requerido' },
        { status: 400 }
      );
    }

    const service = new NormPointService();
    const normPoints = await service.getByChapter(chapter);

    return NextResponse.json({ normPoints, count: normPoints.length });
  } catch (error) {
    console.error(
      `Error in GET /api/sdk/norm-points/chapter/${params.chapter}:`,
      error
    );
    return NextResponse.json(
      {
        error: 'Error al obtener puntos de norma por capítulo',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
