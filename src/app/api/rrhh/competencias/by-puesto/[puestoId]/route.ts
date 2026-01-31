import { NextRequest, NextResponse } from 'next/server';
import { competenceService } from '@/services/rrhh/CompetenceService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ puestoId: string }> }
) {
  try {
    const { puestoId } = await params;
    const data = await competenceService.getByPuesto(puestoId);

    return NextResponse.json(data);
  } catch (error) {
    console.error(
      'Error en GET /api/rrhh/competencias/by-puesto/[puestoId]:',
      error
    );
    return NextResponse.json(
      { error: 'Error al obtener competencias por puesto' },
      { status: 500 }
    );
  }
}
