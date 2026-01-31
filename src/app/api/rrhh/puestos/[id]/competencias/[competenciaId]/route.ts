import { NextRequest, NextResponse } from 'next/server';
import { PositionService } from '@/services/rrhh/PositionService';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; competenciaId: string }> }
) {
  try {
    const { id, competenciaId } = await params;
    await PositionService.removeCompetence(id, competenciaId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(
      'Error en DELETE /api/rrhh/puestos/[id]/competencias/[competenciaId]:',
      error
    );
    return NextResponse.json(
      { error: 'Error al quitar competencia del puesto' },
      { status: 500 }
    );
  }
}
