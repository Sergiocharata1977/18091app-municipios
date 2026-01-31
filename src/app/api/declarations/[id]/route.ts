import { DeclarationService } from '@/services/declarations/DeclarationService';
import { NextRequest, NextResponse } from 'next/server';

// GET - Get declaration by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const declaration = await DeclarationService.getById(params.id);

    if (!declaration) {
      return NextResponse.json(
        { success: false, error: 'Declaración no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: declaration,
    });
  } catch (error) {
    console.error('Error in GET /api/declarations/[id]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}

// PATCH - Review declaration
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const userId = 'temp-user-id'; // TODO: Get from auth
    const userName = 'Usuario Temporal';

    await DeclarationService.review(params.id, body, userId, userName);

    return NextResponse.json({
      success: true,
      message: 'Declaración revisada exitosamente',
    });
  } catch (error) {
    console.error('Error in PATCH /api/declarations/[id]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete declaration
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await DeclarationService.delete(params.id);

    return NextResponse.json({
      success: true,
      message: 'Declaración eliminada exitosamente',
    });
  } catch (error) {
    console.error('Error in DELETE /api/declarations/[id]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
