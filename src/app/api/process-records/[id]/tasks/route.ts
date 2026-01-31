import { processRecordTaskSchema } from '@/lib/validations/processRecords';
import { ProcessRecordTaskServiceAdmin } from '@/services/processRecords/ProcessRecordTaskServiceAdmin';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/process-records/[id]/tasks - Get all tasks for a process record
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const stageId = searchParams.get('stage_id');

    let tasks;
    if (stageId) {
      tasks = await ProcessRecordTaskServiceAdmin.getByStageId(stageId);
    } else {
      tasks = await ProcessRecordTaskServiceAdmin.getByProcessRecordId(id);
    }

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error getting tasks:', error);
    return NextResponse.json(
      { error: 'Error al obtener tareas' },
      { status: 500 }
    );
  }
}

// POST /api/process-records/[id]/tasks - Create new task
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { stage_id, ...taskData } = body;

    if (!stage_id) {
      return NextResponse.json(
        { error: 'Se requiere stage_id' },
        { status: 400 }
      );
    }

    const validatedData = processRecordTaskSchema.parse({
      ...taskData,
      fecha_vencimiento: taskData.fecha_vencimiento
        ? new Date(taskData.fecha_vencimiento)
        : undefined,
    });

    const userId = body.created_by || 'system';

    const taskId = await ProcessRecordTaskServiceAdmin.create(
      id,
      stage_id,
      validatedData,
      userId
    );

    return NextResponse.json(
      { id: taskId, message: 'Tarea creada exitosamente' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating task:', error);
    const message =
      error instanceof Error ? error.message : 'Error al crear tarea';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
