import { NextRequest, NextResponse } from 'next/server';
import { EvaluationService } from '@/services/rrhh/EvaluationService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ personnelId: string; competenceId: string }> }
) {
  try {
    const { personnelId, competenceId } = await params;
    const history = await EvaluationService.getCompetenceHistory(
      personnelId,
      competenceId
    );
    return NextResponse.json(history);
  } catch (error) {
    console.error(
      'Error en GET /api/rrhh/evaluaciones/history/[personnelId]/[competenceId]:',
      error
    );

    if (error instanceof Error && error.message.includes('no encontrado')) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: 'Error al obtener historial de competencia' },
      { status: 500 }
    );
  }
}
