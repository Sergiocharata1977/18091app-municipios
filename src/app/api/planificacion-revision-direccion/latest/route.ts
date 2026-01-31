/**
 * API Route: Obtener revisión vigente
 * GET /api/planificacion-revision-direccion/latest
 */

import { PlanificacionRevisionDireccionService } from '@/services/planificacion-revision-direccion/PlanificacionRevisionDireccionService';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const latest = await PlanificacionRevisionDireccionService.getLatest();

    if (!latest) {
      return NextResponse.json(
        { error: 'No se encontró ninguna revisión vigente' },
        { status: 404 }
      );
    }

    return NextResponse.json(latest);
  } catch (error) {
    console.error(
      'Error en GET /api/planificacion-revision-direccion/latest:',
      error
    );
    return NextResponse.json(
      { error: 'Error al obtener la revisión vigente' },
      { status: 500 }
    );
  }
}
