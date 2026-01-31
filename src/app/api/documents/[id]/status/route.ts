import { NextRequest, NextResponse } from 'next/server';
import { DocumentService } from '@/services/documents/DocumentService';
import { DocumentStatusSchema } from '@/lib/validations/documents';
import { z } from 'zod';

// PATCH /api/documents/[id]/status - Change document status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate status
    const { status, userId } = z
      .object({
        status: DocumentStatusSchema,
        userId: z.string().min(1, 'User ID is required'),
      })
      .parse(body);

    const document = await DocumentService.changeStatus(id, status, userId);

    return NextResponse.json(document);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message.includes('transición')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error('Error changing document status:', error);
    return NextResponse.json(
      { error: 'Error al cambiar estado del documento' },
      { status: 500 }
    );
  }
}
