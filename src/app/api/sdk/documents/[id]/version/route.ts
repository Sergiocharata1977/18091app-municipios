/**
 * Document Version API Route - SDK Unified
 *
 * POST /api/sdk/documents/[id]/version - Create new document version
 * GET /api/sdk/documents/[id]/version - Get version history
 */

import { NextRequest, NextResponse } from 'next/server';
import { DocumentService } from '@/lib/sdk/modules/documents';
import { CreateVersionSchema } from '@/lib/sdk/modules/documents/validations';

// POST /api/sdk/documents/[id]/version - Create new document version
export async function POST(
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

    // Validate data using SDK schema
    const validatedData = CreateVersionSchema.parse(body);

    const userId = body.userId || 'system';

    const service = new DocumentService();
    const document = await service.getById(id);

    if (!document) {
      return NextResponse.json(
        { error: 'Documento no encontrado' },
        { status: 404 }
      );
    }

    // Create new version
    await service.createVersion(id, validatedData, userId);

    return NextResponse.json({
      message: 'Nueva versión del documento creada exitosamente',
      id,
      versionNumber: document.currentVersion + 1,
    });
  } catch (error) {
    console.error(
      `Error in POST /api/sdk/documents/${params.id}/version:`,
      error
    );

    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Error al crear versión del documento',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET /api/sdk/documents/[id]/version - Get version history
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
    const versionHistory = await service.getVersionHistory(id);

    return NextResponse.json({
      versionHistory,
      count: versionHistory.length,
    });
  } catch (error) {
    console.error(
      `Error in GET /api/sdk/documents/${params.id}/version:`,
      error
    );
    return NextResponse.json(
      {
        error: 'Error al obtener historial de versiones',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
