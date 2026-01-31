import { ChecklistTemplateServiceAdmin } from '@/services/checklists/ChecklistTemplateServiceAdmin';
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

// GET /api/checklists/templates - Get all templates for organization
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
    const activeOnly = searchParams.get('active') === 'true';

    const templates = activeOnly
      ? await ChecklistTemplateServiceAdmin.getAllActive(organizationId)
      : await ChecklistTemplateServiceAdmin.getAll(organizationId);

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error getting templates:', error);
    return NextResponse.json(
      { error: 'Error al obtener plantillas' },
      { status: 500 }
    );
  }
}

// POST /api/checklists/templates - Create new template
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

    const id = await ChecklistTemplateServiceAdmin.create(
      body,
      organizationId,
      userId || 'system'
    );

    return NextResponse.json(
      { id, message: 'Plantilla creada exitosamente' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating template:', error);
    const message =
      error instanceof Error ? error.message : 'Error al crear plantilla';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
