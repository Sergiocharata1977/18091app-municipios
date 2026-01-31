import { ActionExecutionSchema } from '@/lib/validations/actions';
import { ActionService } from '@/services/actions/ActionService';
import { NextRequest, NextResponse } from 'next/server';

// ============================================
// POST - Actualizar ejecución (Formulario 2)
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
    const validatedData = ActionExecutionSchema.parse(body);

    // Actualizar ejecución
    await ActionService.updateExecution(id, validatedData, userId, userName);

    return NextResponse.json({
      message: 'Ejecución actualizada exitosamente',
    });
  } catch (error: unknown) {
    console.error('Error in POST /api/actions/[id]/execution:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al actualizar la ejecución' },
      { status: 500 }
    );
  }
}
