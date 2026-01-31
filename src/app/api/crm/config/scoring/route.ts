// src/app/api/crm/config/scoring/route.ts
// API para gestión de configuración de scoring

import { EvaluacionRiesgoService } from '@/services/crm/EvaluacionRiesgoService';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organization_id');

    if (!organizationId) {
      return NextResponse.json(
        { success: false, error: 'organization_id es requerido' },
        { status: 400 }
      );
    }

    const config =
      await EvaluacionRiesgoService.getOrCreateConfig(organizationId);

    return NextResponse.json({
      success: true,
      data: config,
    });
  } catch (error: any) {
    console.error('Error in GET /api/crm/config/scoring:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error interno' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { success: false, error: 'id de configuración es requerido' },
        { status: 400 }
      );
    }

    // Validar que los pesos sumen 100%
    const totalPesos =
      (body.peso_cualitativos || 0) +
      (body.peso_conflictos || 0) +
      (body.peso_cuantitativos || 0);

    if (Math.abs(totalPesos - 1) > 0.01) {
      return NextResponse.json(
        {
          success: false,
          error: `Los pesos deben sumar 100%. Actual: ${Math.round(totalPesos * 100)}%`,
        },
        { status: 400 }
      );
    }

    await EvaluacionRiesgoService.updateConfig(body.id, {
      peso_cualitativos: body.peso_cualitativos,
      peso_conflictos: body.peso_conflictos,
      peso_cuantitativos: body.peso_cuantitativos,
      tier_a_min_score: body.tier_a_min_score,
      tier_a_max_patrimonio: body.tier_a_max_patrimonio,
      tier_b_min_score: body.tier_b_min_score,
      tier_b_max_patrimonio: body.tier_b_max_patrimonio,
      tier_c_min_score: body.tier_c_min_score,
      tier_c_max_patrimonio: body.tier_c_max_patrimonio,
      frecuencia_actualizacion_meses: body.frecuencia_actualizacion_meses,
    });

    return NextResponse.json({
      success: true,
      message: 'Configuración actualizada',
    });
  } catch (error: any) {
    console.error('Error in PATCH /api/crm/config/scoring:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al actualizar' },
      { status: 500 }
    );
  }
}
