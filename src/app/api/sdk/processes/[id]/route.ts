/**
 * Process Detail API Route - SDK Unified
 *
 * GET /api/sdk/processes/[id] - Get process by ID
 * PUT /api/sdk/processes/[id] - Update process
 * DELETE /api/sdk/processes/[id] - Delete process
 */

import { NextRequest, NextResponse } from 'next/server';
import { ProcessService } from '@/lib/sdk/modules/processes';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'ID de proceso requerido' },
        { status: 400 }
      );
    }

    const service = new ProcessService();
    const process = await service.getById(id);

    if (!process) {
      return NextResponse.json(
        { error: 'Proceso no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: process }, { status: 200 });
  } catch (error) {
    console.error(`Error in GET /api/sdk/processes/${params.id}:`, error);
    return NextResponse.json(
      {
        error: 'Error al obtener proceso',
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
        { error: 'ID de proceso requerido' },
        { status: 400 }
      );
    }

    const service = new ProcessService();
    await service.update(id, body, 'system');

    return NextResponse.json(
      { message: 'Proceso actualizado exitosamente', id },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error in PUT /api/sdk/processes/${params.id}:`, error);
    return NextResponse.json(
      {
        error: 'Error al actualizar proceso',
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
        { error: 'ID de proceso requerido' },
        { status: 400 }
      );
    }

    const service = new ProcessService();
    await service.delete(id);

    return NextResponse.json(
      { message: 'Proceso eliminado exitosamente', id },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error in DELETE /api/sdk/processes/${params.id}:`, error);
    return NextResponse.json(
      {
        error: 'Error al eliminar proceso',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
