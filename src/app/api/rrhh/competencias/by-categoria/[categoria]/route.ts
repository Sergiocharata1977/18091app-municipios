import { NextRequest, NextResponse } from 'next/server';
import { competenceService } from '@/services/rrhh/CompetenceService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ categoria: string }> }
) {
  try {
    const { categoria } = await params;
    const organizationId = request.headers.get('x-organization-id');

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID requerido' },
        { status: 400 }
      );
    }

    const data = await competenceService.getByCategory(
      organizationId,
      categoria
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error(
      'Error en GET /api/rrhh/competencias/by-categoria/[categoria]:',
      error
    );
    return NextResponse.json(
      { error: 'Error al obtener competencias por categoría' },
      { status: 500 }
    );
  }
}
