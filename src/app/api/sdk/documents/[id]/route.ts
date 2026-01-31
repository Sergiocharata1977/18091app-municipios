/**
 * Document API Routes - SDK Unified
 *
 * GET /api/sdk/documents/[id] - Get document by ID
 * PUT /api/sdk/documents/[id] - Update document status
 * DELETE /api/sdk/documents/[id] - Delete document
 */

import { NextRequest, NextResponse } from 'next/server';
import { DocumentService } from '@/lib/sdk/modules/documents';

// GET /api/sdk/documents/[id] - Get document by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'ID de documento requerido' },
        { status: 400 }
      );
    }

    const service = new DocumentService();
    const document = await service.getById(id);

    if (!document) {
      return NextResponse.json(
        { error: 'Documento no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ document });
  } catch (error) {
    console.error(`Error in GET /api/sdk/documents/${params.id}:`, error);
    return NextResponse.json(
      {
        error: 'Error al obtener documento',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// PUT /api/sdk/documents/[id] - Update document status
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'ID de documento requerido' },
        { status: 400 }
      );
    }

    const { status } = body;
    if (!status) {
      return NextResponse.json({ error: 'Estado requerido' }, { status: 400 });
    }

    const userId = body.userId || 'system';

    const service = new DocumentService();
    const document = await service.getById(id);

    if (!document) {
      return NextResponse.json(
        { error: 'Documento no encontrado' },
        { status: 404 }
      );
    }

    // Update document status
    await service.updateStatus(id, status, userId);

    return NextResponse.json({
      message: 'Estado del documento actualizado exitosamente',
      id,
      status,
    });
  } catch (error) {
    console.error(`Error in PUT /api/sdk/documents/${params.id}:`, error);
    return NextResponse.json(
      {
        error: 'Error al actualizar documento',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/sdk/documents/[id] - Delete document (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'ID de documento requerido' },
        { status: 400 }
      );
    }

    const service = new DocumentService();
    const document = await service.getById(id);

    if (!document) {
      return NextResponse.json(
        { error: 'Documento no encontrado' },
        { status: 404 }
      );
    }

    await service.delete(id);

    return NextResponse.json({
      message: 'Documento eliminado exitosamente',
      id,
    });
  } catch (error) {
    console.error(`Error in DELETE /api/sdk/documents/${params.id}:`, error);
    return NextResponse.json(
      {
        error: 'Error al eliminar documento',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
