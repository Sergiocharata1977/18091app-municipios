import { NextRequest, NextResponse } from 'next/server';
import { DepartmentService } from '@/services/rrhh/DepartmentService';
import { departmentSchema } from '@/lib/validations/rrhh';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const department = await DepartmentService.getById(id);

    if (!department) {
      return NextResponse.json(
        { error: 'Departamento no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(department);
  } catch (error) {
    console.error('Error in department GET:', error);
    return NextResponse.json(
      { error: 'Error al obtener departamento' },
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
    const validatedData = departmentSchema.parse(body);

    const department = await DepartmentService.update(id, validatedData);

    return NextResponse.json(department);
  } catch (error) {
    console.error('Error in department PUT:', error);

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
      { error: 'Error al actualizar departamento' },
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
    await DepartmentService.delete(id);

    return NextResponse.json({
      message: 'Departamento eliminado exitosamente',
    });
  } catch (error) {
    console.error('Error in department DELETE:', error);
    return NextResponse.json(
      { error: 'Error al eliminar departamento' },
      { status: 500 }
    );
  }
}

// PATCH for toggling active status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (body.action === 'toggle_active') {
      const department = await DepartmentService.toggleActive(id);
      return NextResponse.json(department);
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
  } catch (error) {
    console.error('Error in department PATCH:', error);
    return NextResponse.json(
      { error: 'Error al actualizar departamento' },
      { status: 500 }
    );
  }
}
