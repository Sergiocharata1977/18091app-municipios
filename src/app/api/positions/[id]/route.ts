import { NextRequest, NextResponse } from 'next/server';
import { PositionService } from '@/services/rrhh/PositionService';
import { PositionFormData } from '@/types/rrhh';

// GET /api/positions/[id] - Obtener puesto por ID con asignaciones expandidas
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const position = await PositionService.getByIdWithAssignments(id);

    if (!position) {
      return NextResponse.json(
        { error: 'Puesto no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(position);
  } catch (error) {
    console.error('Error getting position:', error);
    return NextResponse.json(
      { error: 'Error al obtener puesto' },
      { status: 500 }
    );
  }
}

// PUT /api/positions/[id] - Actualizar información básica del puesto
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const data: Partial<PositionFormData> = {
      nombre: body.nombre,
      descripcion_responsabilidades: body.descripcion_responsabilidades,
      requisitos_experiencia: body.requisitos_experiencia,
      requisitos_formacion: body.requisitos_formacion,
      departamento_id: body.departamento_id,
      reporta_a_id: body.reporta_a_id,
    };

    await PositionService.update(id, data);

    return NextResponse.json({ message: 'Puesto actualizado exitosamente' });
  } catch (error) {
    console.error('Error updating position:', error);
    const message =
      error instanceof Error ? error.message : 'Error al actualizar puesto';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/positions/[id] - Eliminar puesto
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await PositionService.delete(id);

    return NextResponse.json({ message: 'Puesto eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting position:', error);
    const message =
      error instanceof Error ? error.message : 'Error al eliminar puesto';
    const status = message.includes('persona(s) activa(s)') ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
