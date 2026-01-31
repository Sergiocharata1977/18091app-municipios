// src/app/api/crm/estados-financieros/situacion/route.ts
// API para Estado de Situación Patrimonial

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
      await EstadosFinancierosService.getSituacionPatrimonialByCliente(
        organizationId,
        clienteId
      );

    return NextResponse.json({
      success: true,
      data: estados,
    });
  } catch (error: unknown) {
    console.error(
      'Error in GET /api/crm/estados-financieros/situacion:',
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

    const estado = await EstadosFinancierosService.createSituacionPatrimonial(
      body.organization_id,
      body.user_id || 'sistema',
      {
        crm_organizacion_id: body.crm_organizacion_id,
        cliente_nombre: body.cliente_nombre,
        cliente_cuit: body.cliente_cuit,
        ejercicio: body.ejercicio,
        fecha_cierre: body.fecha_cierre,
        fuente_datos: body.fuente_datos || 'declaracion',
        activo_corriente: body.activo_corriente,
        activo_no_corriente: body.activo_no_corriente,
        pasivo_corriente: body.pasivo_corriente,
        pasivo_no_corriente: body.pasivo_no_corriente,
        patrimonio_neto: body.patrimonio_neto,
        observaciones: body.observaciones,
      }
    );

    return NextResponse.json({
      success: true,
      data: estado,
    });
  } catch (error: unknown) {
    console.error(
      'Error in POST /api/crm/estados-financieros/situacion:',
      error
    );
    return NextResponse.json(
      { success: false, error: 'Error al crear estado' },
      { status: 500 }
    );
  }
}
