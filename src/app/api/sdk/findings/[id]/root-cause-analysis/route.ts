/**
 * Finding Root Cause Analysis API Route - SDK Unified
 *
 * PUT /api/sdk/findings/[id]/root-cause-analysis - Update Phase 4
 */

import { NextRequest, NextResponse } from 'next/server';
import { FindingService } from '@/lib/sdk/modules/findings';
import { UpdateFindingRootCauseAnalysisSchema } from '@/lib/sdk/modules/findings/validations';

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
    const validatedData = UpdateFindingRootCauseAnalysisSchema.parse(body);

    const userId = body.userId || 'system';

    const service = new FindingService();
    const finding = await service.getById(id);

    if (!finding) {
      return NextResponse.json(
        { error: 'Hallazgo no encontrado' },
        { status: 404 }
      );
    }

    // Update root cause analysis (Phase 4)
    await service.updateRootCauseAnalysis(id, validatedData, userId);

    return NextResponse.json({
      message: 'Análisis de causa raíz actualizado exitosamente',
      id,
      phase: 'root_cause_analyzed',
      progress: 75,
    });
  } catch (error) {
    console.error(
      `Error in PUT /api/sdk/findings/${params.id}/root-cause-analysis:`,
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
        error: 'Error al actualizar análisis de causa raíz',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
