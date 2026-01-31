/**
 * API Route: GET /api/planificacion-revision-direccion/v2
 * Lista todas las revisiones V2
 */

import { PlanificacionRevisionV2Service } from '@/services/planificacion-revision-direccion/PlanificacionRevisionV2Service';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const revisiones = await PlanificacionRevisionV2Service.getAll();
    return NextResponse.json(revisiones);
  } catch (error) {
    console.error('Error al obtener revisiones V2:', error);
    return NextResponse.json(
      { error: 'Error al obtener las revisiones' },
      { status: 500 }
    );
  }
}

/**
 * API Route: POST /api/planificacion-revision-direccion/v2
 * Crea una nueva revisión V2
 */
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const nuevaRevision =
      await PlanificacionRevisionV2Service.createRevision(data);
    return NextResponse.json(nuevaRevision, { status: 201 });
  } catch (error) {
    console.error('Error al crear revisión V2:', error);
    return NextResponse.json(
      { error: 'Error al crear la revisión' },
      { status: 500 }
    );
  }
}
