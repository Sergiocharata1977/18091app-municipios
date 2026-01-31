import { ReunionTrabajoService } from '@/services/reuniones-trabajo/ReunionTrabajoService';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tipo = searchParams.get('tipo');
    const estado = searchParams.get('estado');
    const organizationId = searchParams.get('organization_id') || 'default-org';

    const reuniones = await ReunionTrabajoService.getAll({
      organization_id: organizationId,
      tipo: tipo || undefined,
      estado: estado || undefined,
    });
    return NextResponse.json(reuniones);
  } catch (error) {
    console.error('Error fetching reuniones:', error);
    return NextResponse.json(
      { error: 'Error al obtener reuniones' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const userId = data.created_by || 'system';
    const reunionId = await ReunionTrabajoService.create(data, userId);
    return NextResponse.json({ id: reunionId }, { status: 201 });
  } catch (error) {
    console.error('Error creating reunion:', error);
    return NextResponse.json(
      { error: 'Error al crear reunión' },
      { status: 500 }
    );
  }
}
