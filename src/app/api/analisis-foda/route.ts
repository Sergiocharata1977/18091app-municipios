import { AnalisisFODAService } from '@/services/analisis-foda/AnalisisFODAService';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tipo = searchParams.get('tipo');
    const estado = searchParams.get('estado');
    const organizationId = searchParams.get('organization_id') || 'default-org';

    const analisis = await AnalisisFODAService.getAll({
      organization_id: organizationId,
      tipo_analisis: tipo || undefined,
      estado: estado || undefined,
    });
    return NextResponse.json(analisis);
  } catch (error) {
    console.error('Error fetching analisis FODA:', error);
    return NextResponse.json(
      { error: 'Error al obtener análisis FODA' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const userId = data.created_by || 'system';
    const analisisId = await AnalisisFODAService.create(data, userId);
    return NextResponse.json({ id: analisisId }, { status: 201 });
  } catch (error) {
    console.error('Error creating analisis FODA:', error);
    return NextResponse.json(
      { error: 'Error al crear análisis FODA' },
      { status: 500 }
    );
  }
}
