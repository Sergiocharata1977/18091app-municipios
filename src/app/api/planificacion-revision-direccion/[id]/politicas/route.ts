/**
 * API Route: Gestión de políticas dentro de una revisión
 * POST /api/planificacion-revision-direccion/[id]/politicas - Agregar política
 * PATCH /api/planificacion-revision-direccion/[id]/politicas - Actualizar política
 * DELETE /api/planificacion-revision-direccion/[id]/politicas - Eliminar política
 */

import { PlanificacionRevisionDireccionService } from '@/services/planificacion-revision-direccion/PlanificacionRevisionDireccionService';
import type {
  CreatePoliticaData,
  UpdatePoliticaData,
} from '@/types/planificacion-revision-direccion';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST - Agregar nueva política a la revisión
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const data: CreatePoliticaData = body;

    if (!data.codigo || !data.titulo) {
      return NextResponse.json(
        { error: 'Código y título son requeridos' },
        { status: 400 }
      );
    }

    const updated = await PlanificacionRevisionDireccionService.addPolitica(
      params.id,
      data
    );
    return NextResponse.json(updated, { status: 201 });
  } catch (error: any) {
    console.error(
      `Error en POST /api/planificacion-revision-direccion/${params.id}/politicas:`,
      error
    );

    if (error.message?.includes('no existe')) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: 'Error al agregar la política' },
      { status: 500 }
    );
  }
}

/**
 * PATCH - Actualizar política existente
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const data: UpdatePoliticaData = body;

    if (!data.id) {
      return NextResponse.json(
        { error: 'El ID de la política es requerido' },
        { status: 400 }
      );
    }

    const updated = await PlanificacionRevisionDireccionService.updatePolitica(
      params.id,
      data
    );
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error(
      `Error en PATCH /api/planificacion-revision-direccion/${params.id}/politicas:`,
      error
    );

    if (error.message?.includes('no existe')) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: 'Error al actualizar la política' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Eliminar política
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const politicaId = searchParams.get('politicaId');

    if (!politicaId) {
      return NextResponse.json(
        { error: 'El ID de la política es requerido' },
        { status: 400 }
      );
    }

    const updated = await PlanificacionRevisionDireccionService.deletePolitica(
      params.id,
      politicaId
    );
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error(
      `Error en DELETE /api/planificacion-revision-direccion/${params.id}/politicas:`,
      error
    );

    if (error.message?.includes('no existe')) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: 'Error al eliminar la política' },
      { status: 500 }
    );
  }
}
