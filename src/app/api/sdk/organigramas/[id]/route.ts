/**
 * Organigrama Detail API Route - SDK Unified
 *
 * GET /api/sdk/organigramas/[id] - Get organigrama by ID
 * PUT /api/sdk/organigramas/[id] - Update organigrama
 * DELETE /api/sdk/organigramas/[id] - Delete organigrama
 */

import { OrganigramaService } from '@/lib/sdk/modules/organigramas';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'ID de organigrama requerido' },
        { status: 400 }
      );
    }

    const service = new OrganigramaService();
    const organigrama = await service.getById(id);

    if (!organigrama) {
      return NextResponse.json(
        { error: 'Organigrama no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: organigrama }, { status: 200 });
  } catch (error) {
    console.error(`Error in GET /api/sdk/organigramas/${params.id}:`, error);
    return NextResponse.json(
      {
        error: 'Error al obtener organigrama',
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
        { error: 'ID de organigrama requerido' },
        { status: 400 }
      );
    }

    const service = new OrganigramaService();
    await service.update(id, body, 'system');

    return NextResponse.json(
      { message: 'Organigrama actualizado exitosamente', id },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error in PUT /api/sdk/organigramas/${params.id}:`, error);
    return NextResponse.json(
      {
        error: 'Error al actualizar organigrama',
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
        { error: 'ID de organigrama requerido' },
        { status: 400 }
      );
    }

    const service = new OrganigramaService();
    await service.delete(id);

    return NextResponse.json(
      { message: 'Organigrama eliminado exitosamente', id },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error in DELETE /api/sdk/organigramas/${params.id}:`, error);
    return NextResponse.json(
      {
        error: 'Error al eliminar organigrama',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
