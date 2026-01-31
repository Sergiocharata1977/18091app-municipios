import { ActionControlExecutionSchema } from '@/lib/validations/actions';
import { ActionService } from '@/services/actions/ActionService';
import { NextRequest, NextResponse } from 'next/server';

// ============================================
// POST - Actualizar ejecución del control (Formulario 4)
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
    if (body.executionDate) {
      body.executionDate = new Date(body.executionDate);
    }

    // Validar datos
    const validatedData = ActionControlExecutionSchema.parse(body);

    // Actualizar ejecución del control
    await ActionService.updateControlExecution(
      id,
      validatedData,
      userId,
      userName
    );

    return NextResponse.json({
      message: 'Control completado exitosamente',
    });
  } catch (error: unknown) {
    console.error('Error in POST /api/actions/[id]/control-execution:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al completar el control' },
      { status: 500 }
    );
  }
}
