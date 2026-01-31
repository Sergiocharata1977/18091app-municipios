// src/app/api/crm/evaluaciones/[id]/route.ts
// API para operaciones sobre una evaluación específica

import { EvaluacionRiesgoService } from '@/services/crm/EvaluacionRiesgoService';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const evaluacion = await EvaluacionRiesgoService.getById(params.id);

    if (!evaluacion) {
      return NextResponse.json(
        { success: false, error: 'Evaluación no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: evaluacion,
    });
  } catch (error: any) {
    console.error('Error in GET /api/crm/evaluaciones/[id]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error interno' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Si es aprobación, validar límite
    if (body.estado === 'aprobada') {
      if (!body.tier_asignado) {
        return NextResponse.json(
          { success: false, error: 'tier_asignado es requerido para aprobar' },
          { status: 400 }
        );
      }

      const resultado = await EvaluacionRiesgoService.aprobar(
        params.id,
        body.tier_asignado,
        body.limite_credito_asignado || 0
      );

      if (!resultado.success) {
        return NextResponse.json(
          { success: false, error: resultado.error },
          { status: 400 }
        );
      }
    } else {
      await EvaluacionRiesgoService.update(params.id, body);
    }

    const evaluacion = await EvaluacionRiesgoService.getById(params.id);

    return NextResponse.json({
      success: true,
      data: evaluacion,
    });
  } catch (error: any) {
    console.error('Error in PATCH /api/crm/evaluaciones/[id]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al actualizar' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await EvaluacionRiesgoService.delete(params.id);

    return NextResponse.json({
      success: true,
      message: 'Evaluación eliminada exitosamente',
    });
  } catch (error: any) {
    console.error('Error in DELETE /api/crm/evaluaciones/[id]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al eliminar' },
      { status: 500 }
    );
  }
}
