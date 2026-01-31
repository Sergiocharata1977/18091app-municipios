import { FlujogramaService } from '@/services/flujogramas/FlujogramaService';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const estado = searchParams.get('estado');
    const procesoId = searchParams.get('proceso_id');
    const organizationId = searchParams.get('organization_id') || 'default-org';

    const flujogramas = await FlujogramaService.getAll({
      organization_id: organizationId,
      estado: estado || undefined,
      proceso_id: procesoId || undefined,
    });
    return NextResponse.json(flujogramas);
  } catch (error) {
    console.error('Error fetching flujogramas:', error);
    return NextResponse.json(
      { error: 'Error al obtener flujogramas' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const userId = data.created_by || 'system';
    const flujogramaId = await FlujogramaService.create(data, userId);
    return NextResponse.json({ id: flujogramaId }, { status: 201 });
  } catch (error) {
    console.error('Error creating flujograma:', error);
    return NextResponse.json(
      { error: 'Error al crear flujograma' },
      { status: 500 }
    );
  }
}
