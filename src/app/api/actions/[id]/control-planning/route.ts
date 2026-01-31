import { ActionControlPlanningSchema } from '@/lib/validations/actions';
import { ActionService } from '@/services/actions/ActionService';
import { NextRequest, NextResponse } from 'next/server';

// ============================================
// POST - Actualizar planificación del control (Formulario 3)
// ============================================

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = 'temp-user-id';
    const userName = 'Usuario Temporal';

    const { id } = await params;
    const body = await request.json();

    // Convertir fechas
    if (body.plannedDate) {
      body.plannedDate = new Date(body.plannedDate);
    }

    // Validar datos
    const validatedData = ActionControlPlanningSchema.parse(body);

    // Actualizar planificación del control
    await ActionService.updateControlPlanning(
      id,
      validatedData,
      userId,
      userName
    );

    return NextResponse.json({
      message: 'Planificación del control actualizada exitosamente',
    });
  } catch (error: unknown) {
    console.error('Error in POST /api/actions/[id]/control-planning:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al actualizar la planificación del control' },
      { status: 500 }
    );
  }
}
