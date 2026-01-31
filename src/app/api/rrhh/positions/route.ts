import {
  paginationSchema,
  positionFiltersSchema,
  positionSchema,
} from '@/lib/validations/rrhh';
import { PositionService } from '@/services/rrhh/PositionService';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // MULTI-TENANT: Validar organization_id
    const organizationId = searchParams.get('organization_id');

    if (!organizationId) {
      return NextResponse.json(
        { error: 'organization_id es requerido' },
        { status: 400 }
      );
    }

    // Parse filters
    const filters = positionFiltersSchema.parse({
      search: searchParams.get('search') || undefined,
      departamento_id: searchParams.get('departamento_id') || undefined,
      reporta_a_id: searchParams.get('reporta_a_id') || undefined,
    });

    // Parse pagination
    const pagination = paginationSchema.parse({
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
      sort: searchParams.get('sort') || undefined,
      order: searchParams.get('order') || 'desc',
    });

    const result = await PositionService.getAll(organizationId);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in positions GET:', error);
    return NextResponse.json(
      { error: 'Error al obtener puestos' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = positionSchema.parse(body);

    const position = await PositionService.create(
      validatedData,
      validatedData.organization_id
    );

    return NextResponse.json(position, { status: 201 });
  } catch (error) {
    console.error('Error in positions POST:', error);

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
      { error: 'Error al crear puesto' },
      { status: 500 }
    );
  }
}
