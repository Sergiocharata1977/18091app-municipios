import { ProcessDefinitionServiceAdmin } from '@/services/processRecords/ProcessDefinitionServiceAdmin';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/process-definitions/[id] - Get single process definition
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const definition =
      await ProcessDefinitionServiceAdmin.getByIdWithRelations(id);

    if (!definition) {
      return NextResponse.json(
        { error: 'Definición no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(definition);
  } catch (error) {
    console.error('Error getting process definition:', error);
    return NextResponse.json(
      { error: 'Error al obtener definición' },
      { status: 500 }
    );
  }
}

// PATCH /api/process-definitions/[id] - Update process definition
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    await ProcessDefinitionServiceAdmin.update(id, body);
    return NextResponse.json({
      message: 'Definición actualizada exitosamente',
    });
  } catch (error) {
    console.error('Error updating process definition:', error);
    return NextResponse.json(
      { error: 'Error al actualizar definición' },
      { status: 500 }
    );
  }
}
