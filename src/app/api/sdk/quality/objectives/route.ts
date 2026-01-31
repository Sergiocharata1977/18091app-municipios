/**
 * Quality Objectives API Route - SDK Unified
 *
 * GET /api/sdk/quality/objectives - List quality objectives
 * POST /api/sdk/quality/objectives - Create quality objective
 */

import { NextRequest, NextResponse } from 'next/server';
import { QualityObjectiveService } from '@/lib/sdk/modules/quality';
import { CreateQualityObjectiveSchema } from '@/lib/sdk/modules/quality/validations';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const service = new QualityObjectiveService();
    let objectives;

    if (status) {
      objectives = await service.getByStatus(status);
    } else {
      objectives = await service.list({}, { limit, offset });
    }

    return NextResponse.json(
      { data: objectives, count: objectives.length },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/sdk/quality/objectives:', error);
    return NextResponse.json(
      {
        error: 'Error al obtener objetivos de calidad',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = CreateQualityObjectiveSchema.parse(body);

    const service = new QualityObjectiveService();
    const id = await service.createAndReturnId(validated, 'system');

    return NextResponse.json(
      { id, message: 'Objetivo de calidad creado exitosamente' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/sdk/quality/objectives:', error);
    return NextResponse.json(
      {
        error: 'Error al crear objetivo de calidad',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
