/**
 * Measurement Detail API Route - SDK Unified
 *
 * GET /api/sdk/quality/measurements/[id] - Get measurement by ID
 * PUT /api/sdk/quality/measurements/[id] - Update measurement
 * DELETE /api/sdk/quality/measurements/[id] - Delete measurement
 */

import { NextRequest, NextResponse } from 'next/server';
import { MeasurementService } from '@/lib/sdk/modules/quality';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'ID de medición requerido' },
        { status: 400 }
      );
    }

    const service = new MeasurementService();
    const measurement = await service.getById(id);

    if (!measurement) {
      return NextResponse.json(
        { error: 'Medición no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: measurement }, { status: 200 });
  } catch (error) {
    console.error(
      `Error in GET /api/sdk/quality/measurements/${params.id}:`,
      error
    );
    return NextResponse.json(
      {
        error: 'Error al obtener medición',
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
        { error: 'ID de medición requerido' },
        { status: 400 }
      );
    }

    const service = new MeasurementService();
    await service.update(id, body, 'system');

    return NextResponse.json(
      { message: 'Medición actualizada exitosamente', id },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      `Error in PUT /api/sdk/quality/measurements/${params.id}:`,
      error
    );
    return NextResponse.json(
      {
        error: 'Error al actualizar medición',
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
        { error: 'ID de medición requerido' },
        { status: 400 }
      );
    }

    const service = new MeasurementService();
    await service.delete(id);

    return NextResponse.json(
      { message: 'Medición eliminada exitosamente', id },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      `Error in DELETE /api/sdk/quality/measurements/${params.id}:`,
      error
    );
    return NextResponse.json(
      {
        error: 'Error al eliminar medición',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
