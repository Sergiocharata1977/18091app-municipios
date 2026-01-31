/**
 * API Route: /api/crm/metricas/clientes-no-atendidos
 * Lista de clientes sin contacto reciente
 */

import { PenetracionMercadoService } from '@/services/crm/PenetracionMercadoService';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const clientesNoAtendidos =
      await PenetracionMercadoService.getClientesNoAtendidos();

    return NextResponse.json({
      success: true,
      data: clientesNoAtendidos,
      count: clientesNoAtendidos.length,
    });
  } catch (error: any) {
    console.error(
      'Error in GET /api/crm/metricas/clientes-no-atendidos:',
      error
    );
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch clientes no atendidos',
      },
      { status: 500 }
    );
  }
}
