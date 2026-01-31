/**
 * Policy Detail API Route - SDK Unified
 *
 * GET /api/sdk/policies/[id] - Get policy by ID
 * PUT /api/sdk/policies/[id] - Update policy
 * DELETE /api/sdk/policies/[id] - Delete policy
 */

import { PoliciaService } from '@/lib/sdk/modules/policies';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'ID de política requerido' },
        { status: 400 }
      );
    }

    const service = new PoliciaService();
    const policy = await service.getById(id);

    if (!policy) {
      return NextResponse.json(
        { error: 'Política no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: policy }, { status: 200 });
  } catch (error) {
    console.error(`Error in GET /api/sdk/policies/${params.id}:`, error);
    return NextResponse.json(
      {
        error: 'Error al obtener política',
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
        { error: 'ID de política requerido' },
        { status: 400 }
      );
    }

    const service = new PoliciaService();
    await service.update(id, body, 'system');

    return NextResponse.json(
      { message: 'Política actualizada exitosamente', id },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error in PUT /api/sdk/policies/${params.id}:`, error);
    return NextResponse.json(
      {
        error: 'Error al actualizar política',
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
        { error: 'ID de política requerido' },
        { status: 400 }
      );
    }

    const service = new PoliciaService();
    await service.delete(id);

    return NextResponse.json(
      { message: 'Política eliminada exitosamente', id },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error in DELETE /api/sdk/policies/${params.id}:`, error);
    return NextResponse.json(
      {
        error: 'Error al eliminar política',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
