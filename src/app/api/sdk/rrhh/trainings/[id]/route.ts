/**
 * Training Detail API Route - SDK Unified
 *
 * GET /api/sdk/rrhh/trainings/[id] - Get training by ID
 * PUT /api/sdk/rrhh/trainings/[id] - Update training
 * DELETE /api/sdk/rrhh/trainings/[id] - Delete training
 */

import { NextRequest, NextResponse } from 'next/server';
import { TrainingService } from '@/lib/sdk/modules/rrhh';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'ID de entrenamiento requerido' },
        { status: 400 }
      );
    }

    const service = new TrainingService();
    const training = await service.getById(id);

    if (!training) {
      return NextResponse.json(
        { error: 'Entrenamiento no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: training }, { status: 200 });
  } catch (error) {
    console.error(`Error in GET /api/sdk/rrhh/trainings/${params.id}:`, error);
    return NextResponse.json(
      {
        error: 'Error al obtener entrenamiento',
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
        { error: 'ID de entrenamiento requerido' },
        { status: 400 }
      );
    }

    const service = new TrainingService();
    await service.update(id, body, 'system');

    return NextResponse.json(
      { message: 'Entrenamiento actualizado exitosamente', id },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error in PUT /api/sdk/rrhh/trainings/${params.id}:`, error);
    return NextResponse.json(
      {
        error: 'Error al actualizar entrenamiento',
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
        { error: 'ID de entrenamiento requerido' },
        { status: 400 }
      );
    }

    const service = new TrainingService();
    await service.delete(id);

    return NextResponse.json(
      { message: 'Entrenamiento eliminado exitosamente', id },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      `Error in DELETE /api/sdk/rrhh/trainings/${params.id}:`,
      error
    );
    return NextResponse.json(
      {
        error: 'Error al eliminar entrenamiento',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
