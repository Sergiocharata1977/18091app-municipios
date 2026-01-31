/**
 * Action Verify Effectiveness API Route - SDK Unified
 *
 * PUT /api/sdk/actions/[id]/verify-effectiveness - Verify action effectiveness
 */

import { NextRequest, NextResponse } from 'next/server';
import { ActionService } from '@/lib/sdk/modules/actions';
import { VerifyEffectivenessSchema } from '@/lib/sdk/modules/actions/validations';

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
    const validatedData = VerifyEffectivenessSchema.parse(body);

    const userId = body.userId || 'system';

    const service = new ActionService();
    const action = await service.getById(id);

    if (!action) {
      return NextResponse.json(
        { error: 'Acción no encontrada' },
        { status: 404 }
      );
    }

    // Verify effectiveness
    await service.verifyEffectiveness(id, validatedData, userId);

    return NextResponse.json({
      message: 'Efectividad de acción verificada exitosamente',
      id,
      isEffective: validatedData.isEffective,
    });
  } catch (error) {
    console.error(
      `Error in PUT /api/sdk/actions/${params.id}/verify-effectiveness:`,
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
        error: 'Error al verificar efectividad de acción',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
