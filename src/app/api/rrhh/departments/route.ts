import {
  departmentFiltersSchema,
  departmentFormSchema,
  paginationSchema,
} from '@/lib/validations/rrhh';
import { DepartmentService } from '@/services/rrhh/DepartmentService';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse filters
    const filters = departmentFiltersSchema.parse({
      search: searchParams.get('search') || undefined,
      is_active:
        searchParams.get('is_active') === 'true'
          ? true
          : searchParams.get('is_active') === 'false'
            ? false
            : undefined,
      responsable_id: searchParams.get('responsable_id') || undefined,
    });

    // Parse pagination
    const pagination = paginationSchema.parse({
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
      sort: searchParams.get('sort') || undefined,
      order: searchParams.get('order') || 'desc',
    });

    const organizationId = searchParams.get('organization_id');

    if (!organizationId) {
      return NextResponse.json(
        { error: 'organization_id es requerido' },
        { status: 400 }
      );
    }

    const result = await DepartmentService.getPaginated(
      organizationId,
      filters,
      pagination
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in departments GET:', error);
    return NextResponse.json(
      { error: 'Error al obtener departamentos' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = departmentFormSchema.parse(body);

    if (!body.organization_id) {
      return NextResponse.json(
        { error: 'organization_id es requerido' },
        { status: 400 }
      );
    }

    const department = await DepartmentService.create(
      validatedData,
      body.organization_id
    );

    return NextResponse.json(department, { status: 201 });
  } catch (error) {
    console.error('Error in departments POST:', error);

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
      { error: 'Error al crear departamento' },
      { status: 500 }
    );
  }
}
