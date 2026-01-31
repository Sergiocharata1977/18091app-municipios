import { ProcessRecordTaskServiceAdmin } from '@/services/processRecords/ProcessRecordTaskServiceAdmin';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/process-records/[id]/tasks/[taskId] - Get single task
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
    const { taskId } = await params;

    const task = await ProcessRecordTaskServiceAdmin.getById(taskId);

    if (!task) {
      return NextResponse.json(
        { error: 'Tarea no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error getting task:', error);
    return NextResponse.json(
      { error: 'Error al obtener tarea' },
      { status: 500 }
    );
  }
}

// PATCH /api/process-records/[id]/tasks/[taskId] - Update task (move to different stage)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
    const { taskId } = await params;
    const body = await request.json();
    const { stage_id, ...otherData } = body;

    // If stage_id is provided, move the task to the new stage
    if (stage_id) {
      await ProcessRecordTaskServiceAdmin.moveToStage(taskId, stage_id, 0);
    }

    // If there are other fields to update
    if (Object.keys(otherData).length > 0) {
      await ProcessRecordTaskServiceAdmin.update(taskId, otherData);
    }

    console.log('[Task] Moved/Updated:', taskId, 'to stage:', stage_id);
    return NextResponse.json({
      id: taskId,
      message: 'Tarea actualizada exitosamente',
    });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Error al actualizar tarea' },
      { status: 500 }
    );
  }
}

// DELETE /api/process-records/[id]/tasks/[taskId] - Delete task
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
    const { taskId } = await params;

    await ProcessRecordTaskServiceAdmin.delete(taskId);

    console.log('[Task] Deleted:', taskId);
    return NextResponse.json({ message: 'Tarea eliminada exitosamente' });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: 'Error al eliminar tarea' },
      { status: 500 }
    );
  }
}
