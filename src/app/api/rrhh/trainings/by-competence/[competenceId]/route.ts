import { NextRequest, NextResponse } from 'next/server';
import { TrainingService } from '@/services/rrhh/TrainingService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ competenceId: string }> }
) {
  try {
    const { competenceId } = await params;
    const trainings = await TrainingService.getByCompetence(competenceId);
    return NextResponse.json(trainings);
  } catch (error) {
    console.error(
      'Error en GET /api/rrhh/trainings/by-competence/[competenceId]:',
      error
    );
    return NextResponse.json(
      { error: 'Error al obtener capacitaciones por competencia' },
      { status: 500 }
    );
  }
}
