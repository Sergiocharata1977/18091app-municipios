/**
 * NormPoint API Routes - SDK Unified
 *
 * GET /api/sdk/norm-points/[id] - Get norm point by ID
 * PUT /api/sdk/norm-points/[id] - Update norm point
 * DELETE /api/sdk/norm-points/[id] - Delete norm point
 */

import { NextRequest, NextResponse } from 'next/server';
import { NormPointService } from '@/lib/sdk/modules/normPoints';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'ID de punto de norma requerido' },
        { status: 400 }
      );
    }

    const service = new NormPointService();
    const normPoint = await service.getById(id);

    if (!normPoint) {
      return NextResponse.json(
        { error: 'Punto de norma no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ normPoint });
  } catch (error) {
    console.error(`Error in GET /api/sdk/norm-points/${params.id}:`, error);
    return NextResponse.json(
      {
        error: 'Error al obtener punto de norma',
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
    return NextResponse.json(
      { error: 'Actualización de puntos de norma no implementada' },
      { status: 501 }
    );
  } catch (error) {
    console.error(`Error in PUT /api/sdk/norm-points/${params.id}:`, error);
    return NextResponse.json(
      {
        error: 'Error al actualizar punto de norma',
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
    return NextResponse.json(
      { error: 'Eliminación de puntos de norma no implementada' },
      { status: 501 }
    );
  } catch (error) {
    console.error(`Error in DELETE /api/sdk/norm-points/${params.id}:`, error);
    return NextResponse.json(
      {
        error: 'Error al eliminar punto de norma',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
