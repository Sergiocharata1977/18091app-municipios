import { FindingService } from '@/services/findings/FindingService';
import type { FindingStatus } from '@/types/findings';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
// GET /api/findings/stats - Obtener estadísticas
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filters = {
      status: (searchParams.get('status') as FindingStatus) || undefined,
      processId: searchParams.get('processId') || undefined,
      year: searchParams.get('year')
        ? parseInt(searchParams.get('year')!)
        : undefined,
    };

    // Validar organization_id
    const organizationId = searchParams.get('organization_id');
    if (!organizationId) {
      return NextResponse.json(
        { error: 'organization_id es requerido' },
        { status: 400 }
      );
    }

    const stats = await FindingService.getStats(organizationId, filters);

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error in GET /api/findings/stats:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    );
  }
}
