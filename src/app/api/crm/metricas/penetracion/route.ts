/**
 * API Route: /api/crm/metricas/penetracion
 * Métricas de penetración de mercado (ISO 9001)
 */

import { PenetracionMercadoService } from '@/services/crm/PenetracionMercadoService';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Obtener parámetros de fecha (por defecto últimos 30 días)
    const fechaFin = searchParams.get('fecha_fin') || new Date().toISOString();
    const fechaInicio =
      searchParams.get('fecha_inicio') ||
      (() => {
        const fecha = new Date();
        fecha.setDate(fecha.getDate() - 30);
        return fecha.toISOString();
      })();

    // Calcular métricas
    const metricas = await PenetracionMercadoService.calcularMetricas(
      fechaInicio,
      fechaFin
    );

    return NextResponse.json({
      success: true,
      data: metricas,
    });
  } catch (error: any) {
    console.error('Error in GET /api/crm/metricas/penetracion:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to calculate métricas',
      },
      { status: 500 }
    );
  }
}
