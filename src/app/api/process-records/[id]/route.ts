import { ProcessRecordServiceAdmin } from '@/services/processRecords/ProcessRecordServiceAdmin';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/process-records/[id] - Get process record by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const record = await ProcessRecordServiceAdmin.getById(id);

    if (!record) {
      return NextResponse.json(
        { error: 'Registro no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(record);
  } catch (error) {
    console.error('Error getting process record:', error);
    return NextResponse.json(
      { error: 'Error al obtener registro' },
      { status: 500 }
    );
  }
}

// PATCH /api/process-records/[id] - Update process record
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    await ProcessRecordServiceAdmin.update(id, body);

    return NextResponse.json({ message: 'Registro actualizado exitosamente' });
  } catch (error) {
    console.error('Error updating process record:', error);
    return NextResponse.json(
      { error: 'Error al actualizar registro' },
      { status: 500 }
    );
  }
}

// DELETE /api/process-records/[id] - Delete process record
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await ProcessRecordServiceAdmin.delete(id);

    return NextResponse.json({ message: 'Registro eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting process record:', error);
    return NextResponse.json(
      { error: 'Error al eliminar registro' },
      { status: 500 }
    );
  }
}
