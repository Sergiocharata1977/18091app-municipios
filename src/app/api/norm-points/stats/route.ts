import { NormPointRelationServiceAdmin } from '@/services/normPoints/NormPointRelationServiceAdmin';
import { NextResponse } from 'next/server';

// GET /api/norm-points/stats - Get compliance statistics
export async function GET() {
  try {
    const stats = await NormPointRelationServiceAdmin.getComplianceStats();

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error getting compliance stats:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas de cumplimiento' },
      { status: 500 }
    );
  }
}
