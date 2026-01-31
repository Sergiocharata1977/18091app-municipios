// src/app/api/crm/evaluaciones/route.ts
// API para gestión de evaluaciones de riesgo crediticio

import { EvaluacionRiesgoService } from '@/services/crm/EvaluacionRiesgoService';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organization_id');
    const clienteId = searchParams.get('cliente_id');
    const soloVigentes = searchParams.get('solo_vigentes') === 'true';

    if (!organizationId) {
      return NextResponse.json(
        { success: false, error: 'organization_id es requerido' },
        { status: 400 }
      );
    }

    let evaluaciones;
    if (clienteId) {
      evaluaciones = await EvaluacionRiesgoService.getByCliente(
        organizationId,
        clienteId
      );
    } else {
      evaluaciones = await EvaluacionRiesgoService.getByOrganization(
        organizationId,
        soloVigentes
      );
    }

    return NextResponse.json({
      success: true,
      data: evaluaciones,
    });
  } catch (error: any) {
    console.error('Error in GET /api/crm/evaluaciones:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error interno' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.organization_id) {
      return NextResponse.json(
        { success: false, error: 'organization_id es requerido' },
        { status: 400 }
      );
    }

    if (!body.crm_organizacion_id) {
      return NextResponse.json(
        { success: false, error: 'crm_organizacion_id es requerido' },
        { status: 400 }
      );
    }

    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'items de evaluación son requeridos' },
        { status: 400 }
      );
    }

    const evaluacion = await EvaluacionRiesgoService.create(
      body.organization_id,
      body.evaluador_id || 'sistema',
      body.evaluador_nombre || 'Sistema',
      {
        crm_organizacion_id: body.crm_organizacion_id,
        cliente_nombre: body.cliente_nombre,
        cliente_cuit: body.cliente_cuit,
        patrimonio_neto_computable: body.patrimonio_neto_computable || 0,
        items: body.items,
        score_nosis: body.score_nosis,
        evaluacion_personal: body.evaluacion_personal,
      }
    );

    return NextResponse.json({
      success: true,
      data: evaluacion,
    });
  } catch (error: any) {
    console.error('Error in POST /api/crm/evaluaciones:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al crear evaluación' },
      { status: 500 }
    );
  }
}
