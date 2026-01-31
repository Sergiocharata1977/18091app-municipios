/**
 * Quality Indicators API Route - SDK Unified
 *
 * GET /api/sdk/quality/indicators - List quality indicators
 * POST /api/sdk/quality/indicators - Create quality indicator
 */

import { NextRequest, NextResponse } from 'next/server';
import { QualityIndicatorService } from '@/lib/sdk/modules/quality';
import { CreateQualityIndicatorSchema } from '@/lib/sdk/modules/quality/validations';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const objectiveId = searchParams.get('objectiveId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const service = new QualityIndicatorService();
    let indicators;

    if (objectiveId) {
      indicators = await service.getByObjective(objectiveId);
    } else {
      indicators = await service.list({}, { limit, offset });
    }

    return NextResponse.json(
      { data: indicators, count: indicators.length },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/sdk/quality/indicators:', error);
    return NextResponse.json(
      {
        error: 'Error al obtener indicadores de calidad',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = CreateQualityIndicatorSchema.parse(body);

    const service = new QualityIndicatorService();
    const id = await service.createAndReturnId(validated, 'system');

    return NextResponse.json(
      { id, message: 'Indicador de calidad creado exitosamente' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/sdk/quality/indicators:', error);
    return NextResponse.json(
      {
        error: 'Error al crear indicador de calidad',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
