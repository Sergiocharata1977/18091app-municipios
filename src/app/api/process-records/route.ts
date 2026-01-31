import { ProcessRecordServiceAdmin } from '@/services/processRecords/ProcessRecordServiceAdmin';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/process-records - Get all process records
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const definitionId = searchParams.get('definition_id');
    const organizationId = searchParams.get('organization_id');

    let records;

    if (definitionId) {
      records = await ProcessRecordServiceAdmin.getByDefinitionId(definitionId);
    } else {
      records = await ProcessRecordServiceAdmin.getAll(
        organizationId || undefined
      );
    }

    return NextResponse.json(records);
  } catch (error) {
    console.error('Error getting process records:', error);
    return NextResponse.json(
      { error: 'Error al obtener registros de procesos' },
      { status: 500 }
    );
  }
}

// POST /api/process-records - Create new process record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Get user ID from body
    const userId = body.created_by || 'system';

    // Create process record using Admin SDK
    const recordId = await ProcessRecordServiceAdmin.create(body, userId);

    return NextResponse.json(
      { id: recordId, message: 'Registro de proceso creado exitosamente' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating process record:', error);
    const message =
      error instanceof Error ? error.message : 'Error al crear registro';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
