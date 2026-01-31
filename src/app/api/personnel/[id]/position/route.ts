import { NextRequest, NextResponse } from 'next/server';
import { PersonnelService } from '@/services/rrhh/PersonnelService';

// PUT /api/personnel/[id]/position - Asignar/cambiar puesto
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!body.positionId) {
      return NextResponse.json(
        { error: 'El ID del puesto es requerido' },
        { status: 400 }
      );
    }

    const replaceAssignments = body.replaceAssignments === true;

    await PersonnelService.changePosition(
      id,
      body.positionId,
      replaceAssignments
    );

    return NextResponse.json({
      message: 'Puesto actualizado exitosamente',
      assignmentsReplaced: replaceAssignments,
    });
  } catch (error) {
    console.error('Error updating personnel position:', error);
    const message =
      error instanceof Error ? error.message : 'Error al actualizar puesto';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
