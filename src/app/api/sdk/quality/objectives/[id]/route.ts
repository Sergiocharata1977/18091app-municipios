/**
 * Quality Objective Detail API Route - SDK Unified
 *
 * GET /api/sdk/quality/objectives/[id] - Get quality objective by ID
 * PUT /api/sdk/quality/objectives/[id] - Update quality objective
 * DELETE /api/sdk/quality/objectives/[id] - Delete quality objective
 */

import { NextRequest, NextResponse } from 'next/server';
import { QualityObjectiveService } from '@/lib/sdk/modules/quality';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'ID de objetivo de calidad requerido' },
        { status: 400 }
      );
    }

    const service = new QualityObjectiveService();
    const objective = await service.getById(id);

    if (!objective) {
      return NextResponse.json(
        { error: 'Objetivo de calidad no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: objective }, { status: 200 });
  } catch (error) {
    console.error(
      `Error in GET /api/sdk/quality/objectives/${params.id}:`,
      error
    );
    return NextResponse.json(
      {
        error: 'Error al obtener objetivo de calidad',
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
        { error: 'ID de objetivo de calidad requerido' },
        { status: 400 }
      );
    }

    const service = new QualityObjectiveService();

    // Si se proporciona progress, usar el método específico
    if (body.progress !== undefined) {
      await service.updateProgress(id, body.progress, 'system');
    } else {
      await service.update(id, body, 'system');
    }

    return NextResponse.json(
      { message: 'Objetivo de calidad actualizado exitosamente', id },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      `Error in PUT /api/sdk/quality/objectives/${params.id}:`,
      error
    );
    return NextResponse.json(
      {
        error: 'Error al actualizar objetivo de calidad',
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
        { error: 'ID de objetivo de calidad requerido' },
        { status: 400 }
      );
    }

    const service = new QualityObjectiveService();
    await service.delete(id);

    return NextResponse.json(
      { message: 'Objetivo de calidad eliminado exitosamente', id },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      `Error in DELETE /api/sdk/quality/objectives/${params.id}:`,
      error
    );
    return NextResponse.json(
      {
        error: 'Error al eliminar objetivo de calidad',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
