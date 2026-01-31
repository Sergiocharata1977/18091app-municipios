import { NextRequest, NextResponse } from 'next/server';
import { PersonnelService } from '@/services/rrhh/PersonnelService';

// PUT /api/personnel/[id]/assignments - Actualizar asignaciones manualmente
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const assignments: {
      procesos_asignados?: string[];
      objetivos_asignados?: string[];
      indicadores_asignados?: string[];
    } = {};

    // Solo incluir los campos que se proporcionaron
    if (body.procesos_asignados !== undefined) {
      assignments.procesos_asignados = body.procesos_asignados;
    }
    if (body.objetivos_asignados !== undefined) {
      assignments.objetivos_asignados = body.objetivos_asignados;
    }
    if (body.indicadores_asignados !== undefined) {
      assignments.indicadores_asignados = body.indicadores_asignados;
    }

    await PersonnelService.updateAssignments(id, assignments);

    return NextResponse.json({
      message: 'Asignaciones actualizadas exitosamente',
    });
  } catch (error) {
    console.error('Error updating personnel assignments:', error);
    const message =
      error instanceof Error
        ? error.message
        : 'Error al actualizar asignaciones';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
