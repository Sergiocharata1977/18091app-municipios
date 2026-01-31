/**
 * Mandatory NormPoints API Route - SDK Unified
 *
 * GET /api/sdk/norm-points/mandatory - Get mandatory norm points
 */

import { NextRequest, NextResponse } from 'next/server';
import { NormPointService } from '@/lib/sdk/modules/normPoints';

export async function GET(request: NextRequest) {
  try {
    const service = new NormPointService();
    const normPoints = await service.getMandatory();

    return NextResponse.json({ normPoints, count: normPoints.length });
  } catch (error) {
    console.error('Error in GET /api/sdk/norm-points/mandatory:', error);
    return NextResponse.json(
      {
        error: 'Error al obtener puntos de norma obligatorios',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
