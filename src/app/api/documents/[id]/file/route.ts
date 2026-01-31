import { DocumentService } from '@/services/documents/DocumentService';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/documents/[id]/file - Upload file
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('[API] Subiendo archivo para documento:', id);

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    console.log('[API] Archivo recibido:', file?.name, file?.size, file?.type);

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó archivo' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID es requerido' },
        { status: 400 }
      );
    }

    const downloadURL = await DocumentService.uploadFile(id, file, userId);
    console.log('[API] Archivo subido exitosamente:', downloadURL);

    return NextResponse.json({ url: downloadURL });
  } catch (error) {
    console.error('[API] Error completo al subir archivo:', error);

    if (error instanceof Error) {
      console.error('[API] Mensaje de error:', error.message);
      console.error('[API] Stack:', error.stack);

      if (error.message.includes('tipo') || error.message.includes('tamaño')) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      // Retornar el mensaje de error específico
      return NextResponse.json(
        { error: `Error al subir archivo: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Error desconocido al subir archivo' },
      { status: 500 }
    );
  }
}

// GET /api/documents/[id]/file - Download file
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID es requerido' },
        { status: 400 }
      );
    }

    const url = await DocumentService.downloadFile(id, userId);

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Error downloading file:', error);
    return NextResponse.json(
      { error: 'Error al descargar archivo' },
      { status: 500 }
    );
  }
}

// DELETE /api/documents/[id]/file - Delete file
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await DocumentService.deleteFile(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { error: 'Error al eliminar archivo' },
      { status: 500 }
    );
  }
}
