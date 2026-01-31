import { NextRequest, NextResponse } from 'next/server';
import { EvaluationService } from '@/services/rrhh/EvaluationService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ personnelId: string }> }
) {
  try {
    const { personnelId } = await params;
    const gaps = await EvaluationService.calculateGaps(personnelId);
    return NextResponse.json(gaps);
  } catch (error) {
    console.error(
      'Error en GET /api/rrhh/evaluaciones/gaps/[personnelId]:',
      error
    );

    if (error instanceof Error && error.message.includes('no encontrado')) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: 'Error al calcular brechas de competencias' },
      { status: 500 }
    );
  }
}
