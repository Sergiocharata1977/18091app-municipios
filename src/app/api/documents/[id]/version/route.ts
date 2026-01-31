import { NextRequest, NextResponse } from 'next/server';
import { DocumentService } from '@/services/documents/DocumentService';
import { z } from 'zod';

// POST /api/documents/[id]/version - Create new version
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { reason, userId } = z
      .object({
        reason: z.string().min(1, 'Change reason is required'),
        userId: z.string().min(1, 'User ID is required'),
      })
      .parse(body);

    const newVersion = await DocumentService.createVersion(id, reason, userId);

    return NextResponse.json(newVersion, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating document version:', error);
    return NextResponse.json(
      { error: 'Error al crear versión del documento' },
      { status: 500 }
    );
  }
}

// GET /api/documents/[id]/version - Get version history
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const versions = await DocumentService.getVersionHistory(id);

    return NextResponse.json(versions);
  } catch (error) {
    console.error('Error getting document versions:', error);
    return NextResponse.json(
      { error: 'Error al obtener historial de versiones' },
      { status: 500 }
    );
  }
}
