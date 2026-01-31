/**
 * API Route: Marcar revisión como vigente
 * PATCH /api/planificacion-revision-direccion/[id]/vigente
 */

import { PlanificacionRevisionDireccionService } from '@/services/planificacion-revision-direccion/PlanificacionRevisionDireccionService';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updated = await PlanificacionRevisionDireccionService.markAsVigente(
      params.id
    );
    return NextResponse.json(updated);
  } catch (error) {
    console.error(
      `Error en PATCH /api/planificacion-revision-direccion/${params.id}/vigente:`,
      error
    );
    return NextResponse.json(
      { error: 'Error al marcar la revisión como vigente' },
      { status: 500 }
    );
  }
}
