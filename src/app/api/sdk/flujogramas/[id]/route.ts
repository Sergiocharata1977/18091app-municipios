/**
 * Flujograma Detail API Route - SDK Unified
 *
 * GET /api/sdk/flujogramas/[id] - Get flujograma by ID
 * PUT /api/sdk/flujogramas/[id] - Update flujograma
 * DELETE /api/sdk/flujogramas/[id] - Delete flujograma
 */

import { NextRequest, NextResponse } from 'next/server';
import { FlujogramaService } from '@/lib/sdk/modules/flujogramas';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'ID de flujograma requerido' },
        { status: 400 }
      );
    }

    const service = new FlujogramaService();
    const flujograma = await service.getById(id);

    if (!flujograma) {
      return NextResponse.json(
        { error: 'Flujograma no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: flujograma }, { status: 200 });
  } catch (error) {
    console.error(`Error in GET /api/sdk/flujogramas/${params.id}:`, error);
    return NextResponse.json(
      {
        error: 'Error al obtener flujograma',
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
        { error: 'ID de flujograma requerido' },
        { status: 400 }
      );
    }

    const service = new FlujogramaService();
    await service.update(id, body, 'system');

    return NextResponse.json(
      { message: 'Flujograma actualizado exitosamente', id },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error in PUT /api/sdk/flujogramas/${params.id}:`, error);
    return NextResponse.json(
      {
        error: 'Error al actualizar flujograma',
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
        { error: 'ID de flujograma requerido' },
        { status: 400 }
      );
    }

    const service = new FlujogramaService();
    await service.delete(id);

    return NextResponse.json(
      { message: 'Flujograma eliminado exitosamente', id },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error in DELETE /api/sdk/flujogramas/${params.id}:`, error);
    return NextResponse.json(
      {
        error: 'Error al eliminar flujograma',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
