/**
 * Action Statistics API Route - SDK Unified
 *
 * GET /api/sdk/actions/stats - Get action statistics
 */

import { ActionService } from '@/lib/sdk/modules/actions';
import type { ActionFilters } from '@/lib/sdk/modules/actions/types';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Extract filters from query parameters
    const filters: ActionFilters = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      status: (searchParams.get('status') as any) || undefined,
      responsibleId: searchParams.get('responsibleId') || undefined,
      findingId: searchParams.get('findingId') || undefined,
    };

    const service = new ActionService();
    const stats = await service.getStats(filters);

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error in GET /api/sdk/actions/stats:', error);
    return NextResponse.json(
      {
        error: 'Error al obtener estadísticas de acciones',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
