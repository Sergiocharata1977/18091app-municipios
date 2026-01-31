import { NextRequest, NextResponse } from 'next/server';
import { EvaluationService } from '@/services/rrhh/EvaluationService';

export async function POST(request: NextRequest) {
  try {
    const { personnelId } = await request.json();

    if (!personnelId) {
      return NextResponse.json(
        { error: 'personnelId es requerido' },
        { status: 400 }
      );
    }

    const evaluation =
      await EvaluationService.createFromPositionTemplate(personnelId);

    return NextResponse.json(evaluation, { status: 201 });
  } catch (error) {
    console.error('Error en POST /api/rrhh/evaluaciones/from-template:', error);

    if (error instanceof Error && error.message.includes('no encontrado')) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: 'Error al crear evaluación desde plantilla' },
      { status: 500 }
    );
  }
}
