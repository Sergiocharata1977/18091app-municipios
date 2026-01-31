/**
 * Finding Statistics API Route - SDK Unified
 *
 * GET /api/sdk/findings/stats - Get finding statistics
 */

import { FindingService } from '@/lib/sdk/modules/findings';
import type { FindingStatus } from '@/lib/sdk/modules/findings/types';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Extract filters from query parameters
    const filters = {
      status: (searchParams.get('status') as FindingStatus) || undefined,
      processId: searchParams.get('processId') || undefined,
      sourceId: searchParams.get('sourceId') || undefined,
      year: searchParams.get('year')
        ? parseInt(searchParams.get('year')!)
        : undefined,
    };

    const service = new FindingService();
    const stats = await service.getStats(filters);

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error in GET /api/sdk/findings/stats:', error);
    return NextResponse.json(
      {
        error: 'Error al obtener estadísticas de hallazgos',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
