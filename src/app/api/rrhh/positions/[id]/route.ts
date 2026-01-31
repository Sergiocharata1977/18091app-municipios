import { NextRequest, NextResponse } from 'next/server';
import { PositionService } from '@/services/rrhh/PositionService';
import { positionSchema } from '@/lib/validations/rrhh';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const position = await PositionService.getById(id);

    if (!position) {
      return NextResponse.json(
        { error: 'Puesto no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(position);
  } catch (error) {
    console.error('Error in position GET:', error);
    return NextResponse.json(
      { error: 'Error al obtener puesto' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = positionSchema.parse(body);

    const position = await PositionService.update(id, validatedData);

    return NextResponse.json(position);
  } catch (error) {
    console.error('Error in position PUT:', error);

    if (
      error &&
      typeof error === 'object' &&
      'name' in error &&
      error.name === 'ZodError'
    ) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: (error as any).errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al actualizar puesto' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await PositionService.delete(id);

    return NextResponse.json({ message: 'Puesto eliminado exitosamente' });
  } catch (error) {
    console.error('Error in position DELETE:', error);
    return NextResponse.json(
      { error: 'Error al eliminar puesto' },
      { status: 500 }
    );
  }
}
