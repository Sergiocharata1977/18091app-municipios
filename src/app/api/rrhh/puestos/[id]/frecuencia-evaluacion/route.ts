import { NextRequest, NextResponse } from 'next/server';
import { PositionService } from '@/services/rrhh/PositionService';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { meses } = await request.json();

    if (typeof meses !== 'number' || meses < 1 || meses > 60) {
      return NextResponse.json(
        { error: 'Los meses deben estar entre 1 y 60' },
        { status: 400 }
      );
    }

    await PositionService.updateFrecuenciaEvaluacion(id, meses);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(
      'Error en PUT /api/rrhh/puestos/[id]/frecuencia-evaluacion:',
      error
    );
    return NextResponse.json(
      { error: 'Error al actualizar frecuencia de evaluación' },
      { status: 500 }
    );
  }
}
