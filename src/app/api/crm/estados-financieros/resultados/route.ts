// src/app/api/crm/estados-financieros/resultados/route.ts
// API para Estado de Resultados

import { EstadosFinancierosService } from '@/services/crm/EstadosFinancierosService';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organization_id');
    const clienteId = searchParams.get('cliente_id');

    if (!organizationId || !clienteId) {
      return NextResponse.json(
        {
          success: false,
          error: 'organization_id y cliente_id son requeridos',
        },
        { status: 400 }
      );
    }

    const estados =
      await EstadosFinancierosService.getEstadoResultadosByCliente(
        organizationId,
        clienteId
      );

    return NextResponse.json({
      success: true,
      data: estados,
    });
  } catch (error: unknown) {
    console.error(
      'Error in GET /api/crm/estados-financieros/resultados:',
      error
    );
    return NextResponse.json(
      { success: false, error: 'Error interno' },
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

    const estado = await EstadosFinancierosService.createEstadoResultados(
      body.organization_id,
      body.user_id || 'sistema',
      {
        crm_organizacion_id: body.crm_organizacion_id,
        cliente_nombre: body.cliente_nombre,
        cliente_cuit: body.cliente_cuit,
        ejercicio: body.ejercicio,
        fecha_inicio: body.fecha_inicio,
        fecha_cierre: body.fecha_cierre,
        fuente_datos: body.fuente_datos || 'declaracion',
        resultados_continuan: body.resultados_continuan,
        resultados_descontinuacion: body.resultados_descontinuacion,
        resultados_extraordinarios: body.resultados_extraordinarios || 0,
        observaciones: body.observaciones,
      }
    );

    return NextResponse.json({
      success: true,
      data: estado,
    });
  } catch (error: unknown) {
    console.error(
      'Error in POST /api/crm/estados-financieros/resultados:',
      error
    );
    return NextResponse.json(
      { success: false, error: 'Error al crear estado' },
      { status: 500 }
    );
  }
}
