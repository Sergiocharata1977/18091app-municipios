/**
 * Quality Indicator Detail API Route - SDK Unified
 *
 * GET /api/sdk/quality/indicators/[id] - Get quality indicator by ID
 * PUT /api/sdk/quality/indicators/[id] - Update quality indicator
 * DELETE /api/sdk/quality/indicators/[id] - Delete quality indicator
 */

import { NextRequest, NextResponse } from 'next/server';
import { QualityIndicatorService } from '@/lib/sdk/modules/quality';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'ID de indicador de calidad requerido' },
        { status: 400 }
      );
    }

    const service = new QualityIndicatorService();
    const indicator = await service.getById(id);

    if (!indicator) {
      return NextResponse.json(
        { error: 'Indicador de calidad no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: indicator }, { status: 200 });
  } catch (error) {
    console.error(
      `Error in GET /api/sdk/quality/indicators/${params.id}:`,
      error
    );
    return NextResponse.json(
      {
        error: 'Error al obtener indicador de calidad',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'ID de indicador de calidad requerido' },
        { status: 400 }
      );
    }

    const service = new QualityIndicatorService();

    // Si se proporciona currentValue, usar el método específico
    if (body.currentValue !== undefined) {
      await service.updateCurrentValue(id, body.currentValue, 'system');
    } else {
      await service.update(id, body, 'system');
    }

    return NextResponse.json(
      { message: 'Indicador de calidad actualizado exitosamente', id },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      `Error in PUT /api/sdk/quality/indicators/${params.id}:`,
      error
    );
    return NextResponse.json(
      {
        error: 'Error al actualizar indicador de calidad',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'ID de indicador de calidad requerido' },
        { status: 400 }
      );
    }

    const service = new QualityIndicatorService();
    await service.delete(id);

    return NextResponse.json(
      { message: 'Indicador de calidad eliminado exitosamente', id },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      `Error in DELETE /api/sdk/quality/indicators/${params.id}:`,
      error
    );
    return NextResponse.json(
      {
        error: 'Error al eliminar indicador de calidad',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
