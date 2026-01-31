import { DeclarationService } from '@/services/declarations/DeclarationService';
import { NextRequest, NextResponse } from 'next/server';

// GET - List declarations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;

    const declarations = await DeclarationService.list(status);

    return NextResponse.json({
      success: true,
      data: declarations,
    });
  } catch (error) {
    console.error('Error in GET /api/declarations:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}

// POST - Create declaration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const declarationId = await DeclarationService.create(body);

    return NextResponse.json({
      success: true,
      data: { id: declarationId },
      message: 'Declaración creada exitosamente',
    });
  } catch (error) {
    console.error('Error in POST /api/declarations:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
