/**
 * Action Execution API Route - SDK Unified
 *
 * PUT /api/sdk/actions/[id]/execution - Update action execution
 */

import { NextRequest, NextResponse } from 'next/server';
import { ActionService } from '@/lib/sdk/modules/actions';
import { UpdateActionExecutionSchema } from '@/lib/sdk/modules/actions/validations';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'ID de acción requerido' },
        { status: 400 }
      );
    }

    // Validate data using SDK schema
    const validatedData = UpdateActionExecutionSchema.parse(body);

    const userId = body.userId || 'system';

    const service = new ActionService();
    const action = await service.getById(id);

    if (!action) {
      return NextResponse.json(
        { error: 'Acción no encontrada' },
        { status: 404 }
      );
    }

    // Update action execution
    await service.updateExecution(id, validatedData, userId);

    return NextResponse.json({
      message: 'Ejecución de acción actualizada exitosamente',
      id,
      status: 'in_progress',
    });
  } catch (error) {
    console.error(
      `Error in PUT /api/sdk/actions/${params.id}/execution:`,
      error
    );

    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Error al actualizar ejecución de acción',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
