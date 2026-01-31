import { competenceService } from '@/services/rrhh/CompetenceService';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const competence = await competenceService.getById(id);

    if (!competence) {
      return NextResponse.json(
        { error: 'Competencia no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(competence);
  } catch (error) {
    console.error('Error en GET /api/rrhh/competencias/[id]:', error);
    return NextResponse.json(
      { error: 'Error al obtener competencia' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    await competenceService.update(id, body);

    const updated = await competenceService.getById(id);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error en PUT /api/rrhh/competencias/[id]:', error);
    return NextResponse.json(
      { error: 'Error al actualizar competencia' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Validar que se puede eliminar
    const canDelete = await competenceService.validateCanDelete(id);

    if (!canDelete) {
      return NextResponse.json(
        {
          error:
            'No se puede eliminar: la competencia está asignada a uno o más puestos',
        },
        { status: 400 }
      );
    }

    await competenceService.delete(id);
    return NextResponse.json({ message: 'Competencia eliminada exitosamente' });
  } catch (error) {
    console.error('Error en DELETE /api/rrhh/competencias/[id]:', error);
    return NextResponse.json(
      { error: 'Error al eliminar competencia' },
      { status: 500 }
    );
  }
}

// PATCH for partial updates (used by detail page)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    await competenceService.update(id, body);

    const updated = await competenceService.getById(id);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error en PATCH /api/rrhh/competencias/[id]:', error);
    return NextResponse.json(
      { error: 'Error al actualizar competencia' },
      { status: 500 }
    );
  }
}
