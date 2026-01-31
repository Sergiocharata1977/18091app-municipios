/**
 * FODA Analysis API Route - SDK Unified
 *
 * GET /api/sdk/foda - List FODA analyses
 * POST /api/sdk/foda - Create FODA analysis
 */

import { AnalisisFODAService } from '@/lib/sdk/modules/foda';
import { CreateAnalisisFODASchema } from '@/lib/sdk/modules/foda/validations';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const service = new AnalisisFODAService();
    const analyses = await service.list({}, { limit, offset });

    return NextResponse.json(
      { data: analyses, count: analyses.length },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/sdk/foda:', error);
    return NextResponse.json(
      {
        error: 'Error al obtener análisis FODA',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = CreateAnalisisFODASchema.parse(body);

    const service = new AnalisisFODAService();
    const id = await service.create(validated, 'system');

    return NextResponse.json(
      { id, message: 'Análisis FODA creado exitosamente' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/sdk/foda:', error);
    return NextResponse.json(
      {
        error: 'Error al crear análisis FODA',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
