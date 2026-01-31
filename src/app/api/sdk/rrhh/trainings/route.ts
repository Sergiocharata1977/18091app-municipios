/**
 * Trainings API Route - SDK Unified
 *
 * GET /api/sdk/rrhh/trainings - List trainings
 * POST /api/sdk/rrhh/trainings - Create training
 */

import { NextRequest, NextResponse } from 'next/server';
import { TrainingService } from '@/lib/sdk/modules/rrhh';
import { CreateTrainingSchema } from '@/lib/sdk/modules/rrhh/validations';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const personnelId = searchParams.get('personnelId');
    const competencyId = searchParams.get('competencyId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const service = new TrainingService();
    let trainings;

    if (personnelId) {
      trainings = await service.getByPersonnel(personnelId);
    } else if (competencyId) {
      trainings = await service.getByCompetence(competencyId);
    } else {
      trainings = await service.list({}, { limit, offset });
    }

    return NextResponse.json(
      { data: trainings, count: trainings.length },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/sdk/rrhh/trainings:', error);
    return NextResponse.json(
      {
        error: 'Error al obtener entrenamientos',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = CreateTrainingSchema.parse(body);

    const service = new TrainingService();
    const id = await service.createAndReturnId(validated, 'system');

    return NextResponse.json(
      { id, message: 'Entrenamiento creado exitosamente' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/sdk/rrhh/trainings:', error);
    return NextResponse.json(
      {
        error: 'Error al crear entrenamiento',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
