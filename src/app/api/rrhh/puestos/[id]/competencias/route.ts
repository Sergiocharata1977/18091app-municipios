import { PositionService } from '@/services/rrhh/PositionService';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const competences = await PositionService.getCompetencesRequired(id);
    return NextResponse.json(competences);
  } catch (error) {
    console.error('Error en GET /api/rrhh/puestos/[id]/competencias:', error);
    return NextResponse.json(
      { error: 'Error al obtener competencias del puesto' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { competenceId, nivelRequerido = 3 } = await request.json();

    if (!competenceId) {
      return NextResponse.json(
        { error: 'competenceId es requerido' },
        { status: 400 }
      );
    }

    await PositionService.addCompetence(id, competenceId, nivelRequerido);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error en POST /api/rrhh/puestos/[id]/competencias:', error);

    if (error instanceof Error && error.message.includes('no encontrada')) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: 'Error al asignar competencia' },
      { status: 500 }
    );
  }
}
