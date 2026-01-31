import { DocumentService } from '@/services/documents/DocumentService';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/documents/stats - Get document statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organization_id');

    if (!organizationId) {
      return NextResponse.json(
        { error: 'organization_id es requerido' },
        { status: 400 }
      );
    }

    const stats = await DocumentService.getStats(organizationId);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error getting document stats:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas de documentos' },
      { status: 500 }
    );
  }
}
