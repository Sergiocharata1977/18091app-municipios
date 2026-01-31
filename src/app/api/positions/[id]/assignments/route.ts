import { NextRequest, NextResponse } from 'next/server';
import { PositionService } from '@/services/rrhh/PositionService';
import { PositionAssignmentsFormData } from '@/types/rrhh';

// PUT /api/positions/[id]/assignments - Actualizar asignaciones de contexto
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const assignments: PositionAssignmentsFormData = {
      procesos_asignados: body.procesos_asignados || [],
      objetivos_asignados: body.objetivos_asignados || [],
      indicadores_asignados: body.indicadores_asignados || [],
    };

    // Actualizar asignaciones del puesto
    await PositionService.updateAssignments(id, assignments);

    // Si se solicita propagar, actualizar todo el personal
    let personnelUpdated = 0;
    if (body.propagate === true) {
      personnelUpdated =
        await PositionService.propagateAssignmentsToPersonnel(id);
    }

    return NextResponse.json({
      message: 'Asignaciones actualizadas exitosamente',
      personnelUpdated,
    });
  } catch (error) {
    console.error('Error updating position assignments:', error);
    const message =
      error instanceof Error
        ? error.message
        : 'Error al actualizar asignaciones';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
