/**
 * Finding Close API Route - SDK Unified
 *
 * PUT /api/sdk/findings/[id]/close - Close finding
 */

import { NextRequest, NextResponse } from 'next/server';
import { FindingService } from '@/lib/sdk/modules/findings';

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

    const userId = body.userId || 'system';

    const service = new FindingService();
    const finding = await service.getById(id);

    if (!finding) {
      return NextResponse.json(
        { error: 'Hallazgo no encontrado' },
        { status: 404 }
      );
    }

    // Close finding
    await service.close(id, userId);

    return NextResponse.json({
      message: 'Hallazgo cerrado exitosamente',
      id,
      status: 'cerrado',
      progress: 100,
    });
  } catch (error) {
    console.error(`Error in PUT /api/sdk/findings/${params.id}/close:`, error);
    return NextResponse.json(
      {
        error: 'Error al cerrar hallazgo',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
