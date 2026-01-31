import { NextRequest, NextResponse } from 'next/server';
import { NormPointService } from '@/services/normPoints/NormPointService';

// GET /api/norm-points/chapter/[chapter] - Get norm points by chapter
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chapter: string }> }
) {
  try {
    const { chapter: chapterStr } = await params;
    const chapter = parseInt(chapterStr);

    if (isNaN(chapter) || chapter < 4 || chapter > 10) {
      return NextResponse.json(
        { error: 'Capítulo inválido. Debe estar entre 4 y 10' },
        { status: 400 }
      );
    }

    const normPoints = await NormPointService.getByChapter(chapter);

    return NextResponse.json(normPoints);
  } catch (error) {
    console.error('Error getting norm points by chapter:', error);
    return NextResponse.json(
      { error: 'Error al obtener puntos de norma por capítulo' },
      { status: 500 }
    );
  }
}
