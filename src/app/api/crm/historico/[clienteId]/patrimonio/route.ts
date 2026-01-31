/**
 * API Route: /api/crm/historico/[clienteId]/patrimonio
 * Gestión de snapshots patrimoniales (maquinarias, inmuebles)
 */

import { HistoricoService } from '@/services/crm/HistoricoService';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { clienteId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const limite = parseInt(searchParams.get('limite') || '12');

    const snapshots = await HistoricoService.getPatrimonioSnapshots(
      params.clienteId,
      limite
    );

    return NextResponse.json({
      success: true,
      data: snapshots,
      count: snapshots.length,
    });
  } catch (error: any) {
    console.error(
      'Error in GET /api/crm/historico/[clienteId]/patrimonio:',
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

    if (!body.organizationId) {
      return NextResponse.json(
        { success: false, error: 'organizationId es requerido' },
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

    const snapshotId = await HistoricoService.addPatrimonioSnapshot(
      body.organizationId,
      params.clienteId,
      {
        maquinarias: body.maquinarias || [],
        inmuebles: body.inmuebles || [],
        otrosBienes: body.otrosBienes || [],
      },
      body.registradoPor
    );

    return NextResponse.json({
      success: true,
      data: { id: snapshotId },
      message: 'Snapshot patrimonial agregado exitosamente',
    });
  } catch (error: any) {
    console.error(
      'Error in POST /api/crm/historico/[clienteId]/patrimonio:',
      error
    );
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to add snapshot' },
      { status: 500 }
    );
  }
}
