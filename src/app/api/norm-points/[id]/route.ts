import { NextRequest, NextResponse } from 'next/server';
import { NormPointService } from '@/services/normPoints/NormPointService';
import { NormPointSchema } from '@/lib/validations/normPoints';
import { NormPointFormData } from '@/types/normPoints';
import { z } from 'zod';

// GET /api/norm-points/[id] - Get norm point by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const normPoint = await NormPointService.getById(id);

    if (!normPoint) {
      return NextResponse.json(
        { error: 'Punto de norma no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(normPoint);
  } catch (error) {
    console.error('Error getting norm point:', error);
    return NextResponse.json(
      { error: 'Error al obtener punto de norma' },
      { status: 500 }
    );
  }
}

// PUT /api/norm-points/[id] - Update norm point
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate with Zod (partial update)
    const validatedData = NormPointSchema.partial().parse(
      body
    ) as Partial<NormPointFormData>;

    const normPoint = await NormPointService.update(id, validatedData);

    return NextResponse.json(normPoint);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating norm point:', error);
    return NextResponse.json(
      { error: 'Error al actualizar punto de norma' },
      { status: 500 }
    );
  }
}

// DELETE /api/norm-points/[id] - Delete norm point
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await NormPointService.delete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting norm point:', error);
    return NextResponse.json(
      { error: 'Error al eliminar punto de norma' },
      { status: 500 }
    );
  }
}
