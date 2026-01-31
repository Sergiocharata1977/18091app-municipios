import { PoliticaService } from '@/services/politicas/PoliticaService';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const estado = searchParams.get('estado');
    const organizationId = searchParams.get('organization_id') || 'default-org';

    const politicas = await PoliticaService.getAll({
      organization_id: organizationId,
      estado: estado || undefined,
    });
    return NextResponse.json(politicas);
  } catch (error) {
    console.error('Error fetching politicas:', error);
    return NextResponse.json(
      { error: 'Error al obtener políticas' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    console.log('Creating politica with data:', data);

    // TODO: Obtener userId del contexto de autenticación
    const userId = 'system-user'; // Placeholder temporal
    const politicaId = await PoliticaService.create(data, userId);
    console.log('Politica created with ID:', politicaId);

    // Obtener la política recién creada para devolverla completa
    const politica = await PoliticaService.getById(politicaId);

    return NextResponse.json({ id: politicaId, ...politica }, { status: 201 });
  } catch (error) {
    console.error('Error creating politica:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      { error: 'Error al crear política', details: errorMessage },
      { status: 500 }
    );
  }
}
