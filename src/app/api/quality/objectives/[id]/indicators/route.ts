import { NextRequest, NextResponse } from 'next/server';
import { QualityIndicatorService } from '@/services/quality/QualityIndicatorService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const indicators = await QualityIndicatorService.getByObjective(id);
    return NextResponse.json(indicators);
  } catch (error) {
    console.error('Error in objective indicators GET:', error);
    return NextResponse.json(
      { error: 'Error al obtener indicadores del objetivo' },
      { status: 500 }
    );
  }
}
