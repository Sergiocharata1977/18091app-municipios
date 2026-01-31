import { NextRequest, NextResponse } from 'next/server';
import { TrainingService } from '@/services/rrhh/TrainingService';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { competenceIds } = await request.json();

    if (!Array.isArray(competenceIds)) {
      return NextResponse.json(
        { error: 'competenceIds debe ser un array' },
        { status: 400 }
      );
    }

    await TrainingService.linkCompetences(id, competenceIds);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(
      'Error en POST /api/rrhh/trainings/[id]/competencias:',
      error
    );

    if (error instanceof Error && error.message.includes('no encontrada')) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: 'Error al vincular competencias a la capacitación' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const training = await TrainingService.getById(id);

    if (!training) {
      return NextResponse.json(
        { error: 'Capacitación no encontrada' },
        { status: 404 }
      );
    }

    // Devolver las competencias desarrolladas
    const competenceIds = training.competenciasDesarrolladas || [];

    if (competenceIds.length === 0) {
      return NextResponse.json([]);
    }

    // Obtener detalles de cada competencia
    const { competenceService } = await import(
      '@/services/rrhh/CompetenceService'
    );
    const competences = await Promise.all(
      competenceIds.map(async (competenceId: string) => {
        try {
          return await competenceService.getById(competenceId);
        } catch {
          return null;
        }
      })
    );

    const validCompetences = competences.filter((comp: any) => comp !== null);

    return NextResponse.json(validCompetences);
  } catch (error) {
    console.error('Error en GET /api/rrhh/trainings/[id]/competencias:', error);
    return NextResponse.json(
      { error: 'Error al obtener competencias de la capacitación' },
      { status: 500 }
    );
  }
}
