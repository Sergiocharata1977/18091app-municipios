import { RelacionProcesosService } from '@/services/relacion-procesos/RelacionProcesosService';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const procesoId = searchParams.get('proceso_id');
    const tipo = searchParams.get('tipo');
    const organizationId = searchParams.get('organization_id') || 'default-org';

    const relaciones = await RelacionProcesosService.getAll({
      organization_id: organizationId,
      proceso_origen_id: procesoId || undefined,
      tipo_relacion: tipo || undefined,
    });
    return NextResponse.json(relaciones);
  } catch (error) {
    console.error('Error fetching relaciones:', error);
    return NextResponse.json(
      { error: 'Error al obtener relaciones de procesos' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const userId = data.created_by || 'system';
    const relacionId = await RelacionProcesosService.create(data, userId);
    return NextResponse.json({ id: relacionId }, { status: 201 });
  } catch (error) {
    console.error('Error creating relacion:', error);
    return NextResponse.json(
      { error: 'Error al crear relación de procesos' },
      { status: 500 }
    );
  }
}
