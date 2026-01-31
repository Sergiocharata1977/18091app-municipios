import { NormPointRelationService } from '@/services/normPoints/NormPointRelationService';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const matrix = await NormPointRelationService.getComplianceMatrix();
    return NextResponse.json(matrix);
  } catch (error) {
    console.error('Error getting compliance matrix:', error);
    return NextResponse.json(
      { error: 'Error al obtener matriz de cumplimiento' },
      { status: 500 }
    );
  }
}
