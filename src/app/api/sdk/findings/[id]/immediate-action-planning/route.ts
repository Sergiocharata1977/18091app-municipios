/**
 * Finding Immediate Action Planning API Route - SDK Unified
 *
 * PUT /api/sdk/findings/[id]/immediate-action-planning - Update Phase 2
 */

import { NextRequest, NextResponse } from 'next/server';
import { FindingService } from '@/lib/sdk/modules/findings';
import { UpdateFindingImmediateActionPlanningSchema } from '@/lib/sdk/modules/findings/validations';

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
      UpdateFindingImmediateActionPlanningSchema.parse(body);

    const userId = body.userId || 'system';

    const service = new FindingService();
    const finding = await service.getById(id);

    if (!finding) {
      return NextResponse.json(
        { error: 'Hallazgo no encontrado' },
        { status: 404 }
      );
    }

    // Update immediate action planning (Phase 2)
    await service.updateImmediateActionPlanning(id, validatedData, userId);

    return NextResponse.json({
      message: 'Planificación de acción inmediata actualizada exitosamente',
      id,
      phase: 'immediate_action_planned',
      progress: 25,
    });
  } catch (error) {
    console.error(
      `Error in PUT /api/sdk/findings/${params.id}/immediate-action-planning:`,
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
        error: 'Error al actualizar planificación de acción inmediata',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
