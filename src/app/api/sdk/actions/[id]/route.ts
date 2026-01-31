/**
 * Action API Routes - SDK Unified
 *
 * GET /api/sdk/actions/[id] - Get action by ID
 * PUT /api/sdk/actions/[id] - Update action
 * DELETE /api/sdk/actions/[id] - Delete action
 */

import { NextRequest, NextResponse } from 'next/server';
import { ActionService } from '@/lib/sdk/modules/actions';

// GET /api/sdk/actions/[id] - Get action by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'ID de acción requerido' },
        { status: 400 }
      );
    }

    const service = new ActionService();
    const action = await service.getById(id);

    if (!action) {
      return NextResponse.json(
        { error: 'Acción no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ action });
  } catch (error) {
    console.error(`Error in GET /api/sdk/actions/${params.id}:`, error);
    return NextResponse.json(
      {
        error: 'Error al obtener acción',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// PUT /api/sdk/actions/[id] - Update action (generic update)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'ID de acción requerido' },
        { status: 400 }
      );
    }

    const userId = body.userId || 'system';

    const service = new ActionService();
    const action = await service.getById(id);

    if (!action) {
      return NextResponse.json(
        { error: 'Acción no encontrada' },
        { status: 404 }
      );
    }

    // For generic updates, we would need to implement an update method
    // For now, this is a placeholder for future implementation
    return NextResponse.json(
      {
        error:
          'Actualización genérica no implementada. Use endpoints específicos.',
      },
      { status: 501 }
    );
  } catch (error) {
    console.error(`Error in PUT /api/sdk/actions/${params.id}:`, error);
    return NextResponse.json(
      {
        error: 'Error al actualizar acción',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/sdk/actions/[id] - Delete action (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'ID de acción requerido' },
        { status: 400 }
      );
    }

    const service = new ActionService();
    const action = await service.getById(id);

    if (!action) {
      return NextResponse.json(
        { error: 'Acción no encontrada' },
        { status: 404 }
      );
    }

    await service.delete(id);

    return NextResponse.json({
      message: 'Acción eliminada exitosamente',
      id,
    });
  } catch (error) {
    console.error(`Error in DELETE /api/sdk/actions/${params.id}:`, error);
    return NextResponse.json(
      {
        error: 'Error al eliminar acción',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
