import { ChecklistRecordServiceAdmin } from '@/services/checklists/ChecklistRecordServiceAdmin';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// Helper to get organization from cookies
async function getOrganizationId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('organization_id')?.value || null;
}

async function getUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('user_id')?.value || null;
}

// GET /api/checklists/records - Get all checklist records for organization
export async function GET(request: NextRequest) {
  try {
    const organizationId = await getOrganizationId();
    if (!organizationId) {
      return NextResponse.json(
        { error: 'No se encontró la organización' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const processRecordId = searchParams.get('process_record_id');

    let records;
    if (processRecordId) {
      records =
        await ChecklistRecordServiceAdmin.getByProcessRecord(processRecordId);
    } else {
      records = await ChecklistRecordServiceAdmin.getAll(organizationId);
    }

    return NextResponse.json(records);
  } catch (error) {
    console.error('Error getting checklist records:', error);
    return NextResponse.json(
      { error: 'Error al obtener registros' },
      { status: 500 }
    );
  }
}

// POST /api/checklists/records - Create new checklist record
export async function POST(request: NextRequest) {
  try {
    const organizationId = await getOrganizationId();
    const userId = await getUserId();

    if (!organizationId) {
      return NextResponse.json(
        { error: 'No se encontró la organización' },
        { status: 401 }
      );
    }

    const body = await request.json();

    const id = await ChecklistRecordServiceAdmin.create(
      body,
      organizationId,
      userId || 'system'
    );

    return NextResponse.json(
      { id, message: 'Checklist creado exitosamente' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating checklist record:', error);
    const message =
      error instanceof Error ? error.message : 'Error al crear checklist';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
