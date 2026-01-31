import { NextRequest, NextResponse } from 'next/server';
import { DocumentService } from '@/services/documents/DocumentService';
import { DocumentUpdateSchema } from '@/lib/validations/documents';
import { z } from 'zod';

// GET /api/documents/[id] - Get document by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const document = await DocumentService.getById(id);

    if (!document) {
      return NextResponse.json(
        { error: 'Documento no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error('Error getting document:', error);
    return NextResponse.json(
      { error: 'Error al obtener documento' },
      { status: 500 }
    );
  }
}

// PUT /api/documents/[id] - Update document
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate with Zod (partial update)
    const validatedData = DocumentUpdateSchema.parse(body);

    const document = await DocumentService.update(id, validatedData);

    return NextResponse.json(document);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating document:', error);
    return NextResponse.json(
      { error: 'Error al actualizar documento' },
      { status: 500 }
    );
  }
}

// DELETE /api/documents/[id] - Delete document (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('[API DELETE] Eliminando documento:', id);

    await DocumentService.archive(id);

    console.log('[API DELETE] Documento archivado exitosamente:', id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API DELETE] Error completo:', error);
    if (error instanceof Error) {
      console.error('[API DELETE] Mensaje:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: 'Error al eliminar documento' },
      { status: 500 }
    );
  }
}
