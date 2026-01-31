/**
 * Finding Immediate Action Execution API Route - SDK Unified
 *
 * PUT /api/sdk/findings/[id]/immediate-action-execution - Update Phase 3
 */

import { NextRequest, NextResponse } from 'next/server';
import { FindingService } from '@/lib/sdk/modules/findings';
import { UpdateFindingImmediateActionExecutionSchema } from '@/lib/sdk/modules/findings/validations';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'ID de hallazgo requerido' },
        { status: 400 }
      );
    }

    // Validate data using SDK schema
    const validatedData =
      UpdateFindingImmediateActionExecutionSchema.parse(body);

    const userId = body.userId || 'system';

    const service = new FindingService();
    const finding = await service.getById(id);

    if (!finding) {
      return NextResponse.json(
        { error: 'Hallazgo no encontrado' },
        { status: 404 }
      );
    }

    // Update immediate action execution (Phase 3)
    await service.updateImmediateActionExecution(id, validatedData, userId);

    return NextResponse.json({
      message: 'Ejecución de acción inmediata actualizada exitosamente',
      id,
      phase: 'immediate_action_executed',
      progress: 50,
    });
  } catch (error) {
    console.error(
      `Error in PUT /api/sdk/findings/${params.id}/immediate-action-execution:`,
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
        error: 'Error al actualizar ejecución de acción inmediata',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
