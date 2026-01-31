import { NextRequest, NextResponse } from 'next/server';
import { EvaluationService } from '@/services/rrhh/EvaluationService';
import { TrainingService } from '@/services/rrhh/TrainingService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ personnelId: string }> }
) {
  try {
    const { personnelId } = await params;
    // Calcular brechas primero
    const gaps = await EvaluationService.calculateGaps(personnelId);

    // Obtener capacitaciones sugeridas basadas en las brechas
    const trainingIds = gaps.flatMap(gap => gap.capacitacionesSugeridas);
    const uniqueTrainingIds = [...new Set(trainingIds)];

    if (uniqueTrainingIds.length === 0) {
      return NextResponse.json([]);
    }

    // Obtener detalles de las capacitaciones
    const trainings = await Promise.all(
      uniqueTrainingIds.map(async trainingId => {
        try {
          return await TrainingService.getById(trainingId);
        } catch {
          return null;
        }
      })
    );

    const validTrainings = trainings.filter(training => training !== null);

    return NextResponse.json(validTrainings);
  } catch (error) {
    console.error(
      'Error en GET /api/rrhh/evaluaciones/recommend-trainings/[personnelId]:',
      error
    );

    if (error instanceof Error && error.message.includes('no encontrado')) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: 'Error al obtener recomendaciones de capacitación' },
      { status: 500 }
    );
  }
}
