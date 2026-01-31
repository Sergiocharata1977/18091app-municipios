import { NormPointSchema } from '@/lib/validations/normPoints';
import { NormPointService } from '@/services/normPoints/NormPointService';
import { NormPointServiceAdmin } from '@/services/normPoints/NormPointServiceAdmin';
import { NormPointFormData } from '@/types/normPoints';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// GET /api/norm-points - List norm points with filters and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse filters
    const filters: Record<string, string | number | boolean | undefined> = {};
    if (searchParams.get('tipo_norma'))
      filters.tipo_norma = searchParams.get('tipo_norma')!;
    if (searchParams.get('chapter'))
      filters.chapter = parseInt(searchParams.get('chapter')!);
    if (searchParams.get('category'))
      filters.category = searchParams.get('category')!;
    if (searchParams.get('priority'))
      filters.priority = searchParams.get('priority')!;
    if (searchParams.get('is_mandatory'))
      filters.is_mandatory = searchParams.get('is_mandatory') === 'true';
    if (searchParams.get('process_id'))
      filters.process_id = searchParams.get('process_id')!;

    // Parse pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sort = searchParams.get('sort') || 'created_at';
    const order = (searchParams.get('order') || 'desc') as 'asc' | 'desc';

    const result = await NormPointServiceAdmin.getPaginated(filters, {
      page,
      limit,
      sort,
      order,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error getting norm points:', error);
    return NextResponse.json(
      { error: 'Error al obtener puntos de norma' },
      { status: 500 }
    );
  }
}

// POST /api/norm-points - Create new norm point
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate with Zod
    const validatedData = NormPointSchema.parse(body) as NormPointFormData;

    const normPoint = await NormPointService.create(validatedData);

    return NextResponse.json(normPoint, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating norm point:', error);
    return NextResponse.json(
      { error: 'Error al crear punto de norma' },
      { status: 500 }
    );
  }
}
