/**
 * Position Detail API Route - SDK Unified
 *
 * GET /api/sdk/rrhh/positions/[id] - Get position by ID
 * PUT /api/sdk/rrhh/positions/[id] - Update position
 * DELETE /api/sdk/rrhh/positions/[id] - Delete position
 */

import { NextRequest, NextResponse } from 'next/server';
import { PositionService } from '@/lib/sdk/modules/rrhh';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'ID de posición requerido' },
        { status: 400 }
      );
    }

    const service = new PositionService();
    const position = await service.getById(id);

    if (!position) {
      return NextResponse.json(
        { error: 'Posición no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: position }, { status: 200 });
  } catch (error) {
    console.error(`Error in GET /api/sdk/rrhh/positions/${params.id}:`, error);
    return NextResponse.json(
      {
        error: 'Error al obtener posición',
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
        { error: 'ID de posición requerido' },
        { status: 400 }
      );
    }

    const service = new PositionService();
    await service.update(id, body, 'system');

    return NextResponse.json(
      { message: 'Posición actualizada exitosamente', id },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error in PUT /api/sdk/rrhh/positions/${params.id}:`, error);
    return NextResponse.json(
      {
        error: 'Error al actualizar posición',
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
        { error: 'ID de posición requerido' },
        { status: 400 }
      );
    }

    const service = new PositionService();
    await service.delete(id);

    return NextResponse.json(
      { message: 'Posición eliminada exitosamente', id },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      `Error in DELETE /api/sdk/rrhh/positions/${params.id}:`,
      error
    );
    return NextResponse.json(
      {
        error: 'Error al eliminar posición',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
