import { NextRequest, NextResponse } from 'next/server';
import { TrainingService } from '@/services/rrhh/TrainingService';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const evaluationId = await TrainingService.createPostEvaluation(id);

    return NextResponse.json({
      success: true,
      evaluationId,
      message: 'Evaluación posterior creada exitosamente',
    });
  } catch (error) {
    console.error(
      'Error en POST /api/rrhh/trainings/[id]/post-evaluation:',
      error
    );

    if (error instanceof Error) {
      if (error.message.includes('no requiere evaluación posterior')) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      if (
        error.message.includes('no encontrada') ||
        error.message.includes('no tiene participantes')
      ) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
    }

    return NextResponse.json(
      { error: 'Error al crear evaluación posterior' },
      { status: 500 }
    );
  }
}
