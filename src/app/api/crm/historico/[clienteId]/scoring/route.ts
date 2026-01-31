/**
 * API Route: /api/crm/historico/[clienteId]/scoring
 * Historial de evaluaciones de scoring (inmutables)
 */

import { HistoricoService } from '@/services/crm/HistoricoService';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { clienteId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const soloVigente = searchParams.get('vigente') === 'true';
    const limite = parseInt(searchParams.get('limite') || '10');

    if (soloVigente) {
      const scoring = await HistoricoService.getUltimoScoringVigente(
        params.clienteId
      );
      return NextResponse.json({
        success: true,
        data: scoring,
      });
    }

    const historial = await HistoricoService.getScoringHistory(
      params.clienteId,
      limite
    );

    return NextResponse.json({
      success: true,
      data: historial,
      count: historial.length,
    });
  } catch (error: any) {
    console.error(
      'Error in GET /api/crm/historico/[clienteId]/scoring:',
      error
    );
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to get scoring history',
      },
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

    if (!body.evaluadoPor?.userId || !body.evaluadoPor?.nombre) {
      return NextResponse.json(
        {
          success: false,
          error: 'evaluadoPor (userId, nombre) es requerido para auditoría',
        },
        { status: 400 }
      );
    }

    if (!body.factoresEvaluados || !body.snapshotDatos) {
      return NextResponse.json(
        {
          success: false,
          error: 'factoresEvaluados y snapshotDatos son requeridos',
        },
        { status: 400 }
      );
    }

    const scoringId = await HistoricoService.addScoringRecord(
      body.organizationId,
      params.clienteId,
      {
        factoresEvaluados: body.factoresEvaluados,
        snapshotDatos: body.snapshotDatos,
        vigenciaDias: body.vigenciaDias,
      },
      body.evaluadoPor
    );

    // Obtener el registro creado para devolver resultado
    const historial = await HistoricoService.getScoringHistory(
      params.clienteId,
      1
    );

    return NextResponse.json({
      success: true,
      data: historial[0],
      message: 'Evaluación de scoring registrada exitosamente',
    });
  } catch (error: any) {
    console.error(
      'Error in POST /api/crm/historico/[clienteId]/scoring:',
      error
    );
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to add scoring record',
      },
      { status: 500 }
    );
  }
}
