/**
 * Flujogramas API Route - SDK Unified
 *
 * GET /api/sdk/flujogramas - List flujogramas
 * POST /api/sdk/flujogramas - Create flujograma
 */

import { NextRequest, NextResponse } from 'next/server';
import { FlujogramaService } from '@/lib/sdk/modules/flujogramas';
import { CreateFlujogramaSchema } from '@/lib/sdk/modules/flujogramas/validations';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const service = new FlujogramaService();
    const flujogramas = await service.list({}, { limit, offset });

    return NextResponse.json(
      { data: flujogramas, count: flujogramas.length },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/sdk/flujogramas:', error);
    return NextResponse.json(
      {
        error: 'Error al obtener flujogramas',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = CreateFlujogramaSchema.parse(body);

    const service = new FlujogramaService();
    const result = await service.create(validated, 'system');
    const id = (result as any).id || result;

    return NextResponse.json(
      { id, message: 'Flujograma creado exitosamente' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/sdk/flujogramas:', error);
    return NextResponse.json(
      {
        error: 'Error al crear flujograma',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
