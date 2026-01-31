import { ProcessRecordStageServiceAdmin } from '@/services/processRecords/ProcessRecordStageServiceAdmin';
import { NextRequest, NextResponse } from 'next/server';

// DELETE /api/process-records/[id]/stages/[stageId] - Delete stage
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; stageId: string }> }
) {
  try {
    const { stageId } = await params;
    await ProcessRecordStageServiceAdmin.delete(stageId);

    return NextResponse.json({ message: 'Etapa eliminada exitosamente' });
  } catch (error) {
    console.error('Error deleting stage:', error);
    return NextResponse.json(
      { error: 'Error al eliminar etapa' },
      { status: 500 }
    );
  }
}

// PATCH /api/process-records/[id]/stages/[stageId] - Update stage
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; stageId: string }> }
) {
  try {
    const { stageId } = await params;
    const body = await request.json();

    await ProcessRecordStageServiceAdmin.update(stageId, body);

    return NextResponse.json({ message: 'Etapa actualizada exitosamente' });
  } catch (error) {
    console.error('Error updating stage:', error);
    return NextResponse.json(
      { error: 'Error al actualizar etapa' },
      { status: 500 }
    );
  }
}
