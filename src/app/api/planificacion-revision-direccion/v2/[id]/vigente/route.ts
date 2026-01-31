/**
 * API Route: PATCH /api/planificacion-revision-direccion/v2/[id]/vigente
 * Marca una revisión como vigente
 */

import { PlanificacionRevisionV2Service } from '@/services/planificacion-revision-direccion/PlanificacionRevisionV2Service';
import { NextResponse } from 'next/server';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const updated = await PlanificacionRevisionV2Service.markAsVigente(
      params.id
    );
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error al marcar como vigente:', error);
    return NextResponse.json(
      { error: 'Error al marcar como vigente' },
      { status: 500 }
    );
  }
}
