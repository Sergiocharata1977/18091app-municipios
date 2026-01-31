/**
 * FODA Analysis Detail API Route - SDK Unified
 *
 * GET /api/sdk/foda/[id] - Get FODA analysis by ID
 * PUT /api/sdk/foda/[id] - Update FODA analysis
 * DELETE /api/sdk/foda/[id] - Delete FODA analysis
 */

import { AnalisisFODAService } from '@/lib/sdk/modules/foda';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'ID de análisis FODA requerido' },
        { status: 400 }
      );
    }

    const service = new AnalisisFODAService();
    const analysis = await service.getById(id);

    if (!analysis) {
      return NextResponse.json(
        { error: 'Análisis FODA no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: analysis }, { status: 200 });
  } catch (error) {
    console.error(`Error in GET /api/sdk/foda/${params.id}:`, error);
    return NextResponse.json(
      {
        error: 'Error al obtener análisis FODA',
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
        { error: 'ID de análisis FODA requerido' },
        { status: 400 }
      );
    }

    const service = new AnalisisFODAService();
    await service.update(id, body, 'system');

    return NextResponse.json(
      { message: 'Análisis FODA actualizado exitosamente', id },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error in PUT /api/sdk/foda/${params.id}:`, error);
    return NextResponse.json(
      {
        error: 'Error al actualizar análisis FODA',
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
        { error: 'ID de análisis FODA requerido' },
        { status: 400 }
      );
    }

    const service = new AnalisisFODAService();
    await service.delete(id);

    return NextResponse.json(
      { message: 'Análisis FODA eliminado exitosamente', id },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error in DELETE /api/sdk/foda/${params.id}:`, error);
    return NextResponse.json(
      {
        error: 'Error al eliminar análisis FODA',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
