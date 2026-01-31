/**
 * Reunion Detail API Route - SDK Unified
 *
 * GET /api/sdk/reuniones/[id] - Get reunion by ID
 * PUT /api/sdk/reuniones/[id] - Update reunion
 * DELETE /api/sdk/reuniones/[id] - Delete reunion
 */

import { NextRequest, NextResponse } from 'next/server';
import { ReunionTrabajoService } from '@/lib/sdk/modules/reuniones';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'ID de reunión requerido' },
        { status: 400 }
      );
    }

    const service = new ReunionTrabajoService();
    const reunion = await service.getById(id);

    if (!reunion) {
      return NextResponse.json(
        { error: 'Reunión no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: reunion }, { status: 200 });
  } catch (error) {
    console.error(`Error in GET /api/sdk/reuniones/${params.id}:`, error);
    return NextResponse.json(
      {
        error: 'Error al obtener reunión',
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
        { error: 'ID de reunión requerido' },
        { status: 400 }
      );
    }

    const service = new ReunionTrabajoService();
    await service.update(id, body, 'system');

    return NextResponse.json(
      { message: 'Reunión actualizada exitosamente', id },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error in PUT /api/sdk/reuniones/${params.id}:`, error);
    return NextResponse.json(
      {
        error: 'Error al actualizar reunión',
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
        { error: 'ID de reunión requerido' },
        { status: 400 }
      );
    }

    const service = new ReunionTrabajoService();
    await service.delete(id);

    return NextResponse.json(
      { message: 'Reunión eliminada exitosamente', id },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error in DELETE /api/sdk/reuniones/${params.id}:`, error);
    return NextResponse.json(
      {
        error: 'Error al eliminar reunión',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
