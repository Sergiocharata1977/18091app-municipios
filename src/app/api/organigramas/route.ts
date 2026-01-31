import { OrganigramaService } from '@/services/organigramas/OrganigramaService';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const estado = searchParams.get('estado');
    const organizationId = searchParams.get('organization_id') || 'default-org';

    const organigramas = await OrganigramaService.getAll({
      organization_id: organizationId,
      estado: estado || undefined,
    });
    return NextResponse.json(organigramas);
  } catch (error) {
    console.error('Error fetching organigramas:', error);
    return NextResponse.json(
      { error: 'Error al obtener organigramas' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const userId = data.created_by || 'system';
    const organigramaId = await OrganigramaService.create(data, userId);
    return NextResponse.json({ id: organigramaId }, { status: 201 });
  } catch (error) {
    console.error('Error creating organigrama:', error);
    return NextResponse.json(
      { error: 'Error al crear organigrama' },
      { status: 500 }
    );
  }
}
