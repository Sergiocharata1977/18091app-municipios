import { NextRequest, NextResponse } from 'next/server';
import { MeasurementService } from '@/services/quality/MeasurementService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const measurements = await MeasurementService.getByIndicator(id);
    return NextResponse.json(measurements);
  } catch (error) {
    console.error('Error in indicator measurements GET:', error);
    return NextResponse.json(
      { error: 'Error al obtener mediciones del indicador' },
      { status: 500 }
    );
  }
}
