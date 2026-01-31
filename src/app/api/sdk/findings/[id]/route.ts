/**
 * Finding API Routes - SDK Unified
 *
 * GET /api/sdk/findings/[id] - Get finding by ID
 * PUT /api/sdk/findings/[id] - Update finding
 * DELETE /api/sdk/findings/[id] - Delete finding
 */

import { NextRequest, NextResponse } from 'next/server';
import { FindingService } from '@/lib/sdk/modules/findings';

// GET /api/sdk/findings/[id] - Get finding by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'ID de hallazgo requerido' },
        { status: 400 }
      );
    }

    const service = new FindingService();
    const finding = await service.getById(id);

    if (!finding) {
      return NextResponse.json(
        { error: 'Hallazgo no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ finding });
  } catch (error) {
    console.error(`Error in GET /api/sdk/findings/${params.id}:`, error);
    return NextResponse.json(
      {
        error: 'Error al obtener hallazgo',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// PUT /api/sdk/findings/[id] - Update finding (generic update)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'ID de hallazgo requerido' },
        { status: 400 }
      );
    }

    const userId = body.userId || 'system';

    const service = new FindingService();
    const finding = await service.getById(id);

    if (!finding) {
      return NextResponse.json(
        { error: 'Hallazgo no encontrado' },
        { status: 404 }
      );
    }

    // For generic updates, we would need to implement an update method
    // For now, this is a placeholder for future implementation
    return NextResponse.json(
      {
        error:
          'Actualización genérica no implementada. Use endpoints específicos de fases.',
      },
      { status: 501 }
    );
  } catch (error) {
    console.error(`Error in PUT /api/sdk/findings/${params.id}:`, error);
    return NextResponse.json(
      {
        error: 'Error al actualizar hallazgo',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/sdk/findings/[id] - Delete finding (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'ID de hallazgo requerido' },
        { status: 400 }
      );
    }

    const service = new FindingService();
    const finding = await service.getById(id);

    if (!finding) {
      return NextResponse.json(
        { error: 'Hallazgo no encontrado' },
        { status: 404 }
      );
    }

    await service.delete(id);

    return NextResponse.json({
      message: 'Hallazgo eliminado exitosamente',
      id,
    });
  } catch (error) {
    console.error(`Error in DELETE /api/sdk/findings/${params.id}:`, error);
    return NextResponse.json(
      {
        error: 'Error al eliminar hallazgo',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
