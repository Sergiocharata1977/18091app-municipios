/**
 * API Route: Gestión de revisión específica
 * GET /api/planificacion-revision-direccion/[id] - Obtener revisión
 * PATCH /api/planificacion-revision-direccion/[id] - Actualizar sección
 * DELETE /api/planificacion-revision-direccion/[id] - Eliminar revisión
 */

import { PlanificacionRevisionDireccionService } from '@/services/planificacion-revision-direccion/PlanificacionRevisionDireccionService';
import type { UpdateSectionData } from '@/types/planificacion-revision-direccion';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET - Obtener revisión por ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const revision = await PlanificacionRevisionDireccionService.getById(
      params.id
    );

    if (!revision) {
      return NextResponse.json(
        { error: 'Revisión no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(revision);
  } catch (error) {
    console.error(
      `Error en GET /api/planificacion-revision-direccion/${params.id}:`,
      error
    );
    return NextResponse.json(
      { error: 'Error al obtener la revisión' },
      { status: 500 }
    );
  }
}

/**
 * PATCH - Actualizar sección de la revisión
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const data: UpdateSectionData = body;

    if (!data.section) {
      return NextResponse.json(
        { error: 'El campo section es requerido' },
        { status: 400 }
      );
    }

    if (!data.updated_by) {
      return NextResponse.json(
        { error: 'El campo updated_by es requerido' },
        { status: 400 }
      );
    }

    const updated = await PlanificacionRevisionDireccionService.updateSection(
      params.id,
      data
    );
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error(
      `Error en PATCH /api/planificacion-revision-direccion/${params.id}:`,
      error
    );

    if (error.message?.includes('no existe')) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: 'Error al actualizar la revisión' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Eliminar revisión
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await PlanificacionRevisionDireccionService.delete(params.id);
    return NextResponse.json({ message: 'Revisión eliminada exitosamente' });
  } catch (error) {
    console.error(
      `Error en DELETE /api/planificacion-revision-direccion/${params.id}:`,
      error
    );
    return NextResponse.json(
      { error: 'Error al eliminar la revisión' },
      { status: 500 }
    );
  }
}
