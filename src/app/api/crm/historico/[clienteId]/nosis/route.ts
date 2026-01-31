/**
 * API Route: /api/crm/historico/[clienteId]/nosis
 * Log de consultas a API Nosis
 */

import { HistoricoService } from '@/services/crm/HistoricoService';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { clienteId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const limite = parseInt(searchParams.get('limite') || '10');

    const consultas = await HistoricoService.getConsultasNosis(
      params.clienteId,
      limite
    );

    return NextResponse.json({
      success: true,
      data: consultas,
      count: consultas.length,
    });
  } catch (error: any) {
    console.error('Error in GET /api/crm/historico/[clienteId]/nosis:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get consultas' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { clienteId: string } }
) {
  try {
    const body = await request.json();

    if (!body.organizationId) {
      return NextResponse.json(
        { success: false, error: 'organizationId es requerido' },
        { status: 400 }
      );
    }

    if (!body.cuit || !body.tipoConsulta) {
      return NextResponse.json(
        { success: false, error: 'cuit y tipoConsulta son requeridos' },
        { status: 400 }
      );
    }

    if (!body.solicitadoPor?.userId || !body.solicitadoPor?.nombre) {
      return NextResponse.json(
        {
          success: false,
          error: 'solicitadoPor (userId, nombre) es requerido',
        },
        { status: 400 }
      );
    }

    const consultaId = await HistoricoService.logConsultaNosis(
      body.organizationId,
      params.clienteId,
      {
        cuit: body.cuit,
        fechaConsulta: new Date().toISOString(),
        tipoConsulta: body.tipoConsulta,
        requestEnviado: body.requestEnviado,
        responseRecibido: body.responseRecibido,
        scoreObtenido: body.scoreObtenido,
        situacionBcra: body.situacionBcra,
        chequesRechazados: body.chequesRechazados,
        juiciosActivos: body.juiciosActivos,
        estado: body.estado || 'exitoso',
        errorMensaje: body.errorMensaje,
        tiempoRespuestaMs: body.tiempoRespuestaMs || 0,
        apiKeyUsada: body.apiKeyUsada || '****',
        solicitadoPor: body.solicitadoPor,
      }
    );

    return NextResponse.json({
      success: true,
      data: { id: consultaId },
      message: 'Consulta Nosis registrada exitosamente',
    });
  } catch (error: any) {
    console.error('Error in POST /api/crm/historico/[clienteId]/nosis:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to log consulta' },
      { status: 500 }
    );
  }
}
