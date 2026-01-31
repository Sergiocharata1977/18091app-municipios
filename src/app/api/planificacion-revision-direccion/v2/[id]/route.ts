/**
 * API Route: GET /api/planificacion-revision-direccion/v2/[id]
 * Obtiene una revisión específica por ID
 */

import { PlanificacionRevisionV2Service } from '@/services/planificacion-revision-direccion/PlanificacionRevisionV2Service';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const revision = await PlanificacionRevisionV2Service.getById(params.id);

    if (!revision) {
      return NextResponse.json(
        { error: 'Revisión no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(revision);
  } catch (error) {
    console.error('Error al obtener revisión V2:', error);
    return NextResponse.json(
      { error: 'Error al obtener la revisión' },
      { status: 500 }
    );
  }
}

/**
 * API Route: PATCH /api/planificacion-revision-direccion/v2/[id]
 * Actualiza una sección específica de la revisión
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const updateData = await request.json();
    const updated = await PlanificacionRevisionV2Service.updateSection(
      params.id,
      updateData
    );

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error al actualizar sección:', error);
    return NextResponse.json(
      { error: 'Error al actualizar la sección' },
      { status: 500 }
    );
  }
}

/**
 * API Route: DELETE /api/planificacion-revision-direccion/v2/[id]
 * Elimina una revisión
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await PlanificacionRevisionV2Service.delete(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar revisión:', error);
    return NextResponse.json(
      { error: 'Error al eliminar la revisión' },
      { status: 500 }
    );
  }
}
