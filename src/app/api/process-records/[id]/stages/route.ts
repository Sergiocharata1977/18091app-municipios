import { ProcessRecordStageServiceAdmin } from '@/services/processRecords/ProcessRecordStageServiceAdmin';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/process-records/[id]/stages - Get all stages for a process record
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const stages =
      await ProcessRecordStageServiceAdmin.getByProcessRecordId(id);
    return NextResponse.json(stages);
  } catch (error) {
    console.error('Error getting stages:', error);
    return NextResponse.json(
      { error: 'Error al obtener etapas' },
      { status: 500 }
    );
  }
}

// POST /api/process-records/[id]/stages - Create new stage
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const stageId = await ProcessRecordStageServiceAdmin.create(id, body);

    return NextResponse.json(
      { id: stageId, message: 'Etapa creada exitosamente' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating stage:', error);
    const message =
      error instanceof Error ? error.message : 'Error al crear etapa';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
