/**
 * API Route: Planificación y Revisión por la Dirección
 * GET /api/planificacion-revision-direccion - Listar todas las revisiones
 * POST /api/planificacion-revision-direccion - Crear nueva revisión
 */

import { PlanificacionRevisionDireccionService } from '@/services/planificacion-revision-direccion/PlanificacionRevisionDireccionService';
import type { CreatePlanificacionRevisionDireccionData } from '@/types/planificacion-revision-direccion';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET - Listar todas las revisiones
 */
export async function GET() {
  try {
    const revisiones = await PlanificacionRevisionDireccionService.getAll();
    return NextResponse.json(revisiones);
  } catch (error) {
    console.error('Error en GET /api/planificacion-revision-direccion:', error);
    return NextResponse.json(
      { error: 'Error al obtener las revisiones' },
      { status: 500 }
    );
  }
}

/**
 * POST - Crear nueva revisión
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data: CreatePlanificacionRevisionDireccionData = body;

    // Validaciones
    if (!data.fecha_revision) {
      return NextResponse.json(
        { error: 'La fecha de revisión es requerida' },
        { status: 400 }
      );
    }

    if (!data.periodo) {
      return NextResponse.json(
        { error: 'El periodo es requerido' },
        { status: 400 }
      );
    }

    if (!data.created_by) {
      return NextResponse.json(
        { error: 'El campo created_by es requerido' },
        { status: 400 }
      );
    }

    const created =
      await PlanificacionRevisionDireccionService.createRevision(data);
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    console.error(
      'Error en POST /api/planificacion-revision-direccion:',
      error
    );
    return NextResponse.json(
      { error: 'Error al crear la revisión' },
      { status: 500 }
    );
  }
}
