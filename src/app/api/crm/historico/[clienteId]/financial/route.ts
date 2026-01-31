/**
 * API Route: /api/crm/historico/[clienteId]/financial
 * Gestión de snapshots financieros (balances, IVA, etc.)
 */

import { HistoricoService } from '@/services/crm/HistoricoService';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { clienteId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo') || undefined;
    const limite = parseInt(searchParams.get('limite') || '12');

    const snapshots = await HistoricoService.getFinancialSnapshots(
      params.clienteId,
      tipo,
      limite
    );

    return NextResponse.json({
      success: true,
      data: snapshots,
      count: snapshots.length,
    });
  } catch (error: any) {
    console.error(
      'Error in GET /api/crm/historico/[clienteId]/financial:',
      error
    );
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get snapshots' },
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

    // Validar campos requeridos
    if (!body.organizationId) {
      return NextResponse.json(
        { success: false, error: 'organizationId es requerido' },
        { status: 400 }
      );
    }

    if (!body.tipoSnapshot || !body.periodo) {
      return NextResponse.json(
        { success: false, error: 'tipoSnapshot y periodo son requeridos' },
        { status: 400 }
      );
    }

    if (!body.registradoPor?.userId || !body.registradoPor?.nombre) {
      return NextResponse.json(
        {
          success: false,
          error: 'registradoPor (userId, nombre) es requerido',
        },
        { status: 400 }
      );
    }

    const snapshotId = await HistoricoService.addFinancialSnapshot(
      body.organizationId,
      params.clienteId,
      {
        tipoSnapshot: body.tipoSnapshot,
        periodo: body.periodo,
        situacionPatrimonial: body.situacionPatrimonial,
        estadoResultados: body.estadoResultados,
        declaracionMensual: body.declaracionMensual,
        documentoUrl: body.documentoUrl,
        fuenteDatos: body.fuenteDatos || 'declaracion_jurada',
      },
      body.registradoPor
    );

    return NextResponse.json({
      success: true,
      data: { id: snapshotId },
      message: 'Snapshot financiero agregado exitosamente',
    });
  } catch (error: any) {
    console.error(
      'Error in POST /api/crm/historico/[clienteId]/financial:',
      error
    );
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to add snapshot' },
      { status: 500 }
    );
  }
}
