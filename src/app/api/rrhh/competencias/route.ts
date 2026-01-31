import { competenceService } from '@/services/rrhh/CompetenceService';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const categoria = searchParams.get('categoria');
    const search = searchParams.get('search');
    const organizationId = searchParams.get('organization_id');

    if (!organizationId) {
      return NextResponse.json(
        { error: 'organization_id es requerido' },
        { status: 400 }
      );
    }

    const competences = await competenceService.getAll(
      organizationId,
      categoria,
      search
    );
    return NextResponse.json(competences);
  } catch (error) {
    console.error('Error en GET /api/rrhh/competencias:', error);
    return NextResponse.json(
      { error: 'Error al obtener competencias' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const competence = await competenceService.create(body);
    return NextResponse.json(competence, { status: 201 });
  } catch (error) {
    console.error('Error en POST /api/rrhh/competencias:', error);
    return NextResponse.json(
      { error: 'Error al crear competencia' },
      { status: 500 }
    );
  }
}
