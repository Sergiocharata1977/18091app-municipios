import { NextRequest, NextResponse } from 'next/server';
import { QualityObjectiveService } from '@/services/quality/QualityObjectiveService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const objectives = await QualityObjectiveService.getByProcess(id);
    return NextResponse.json(objectives);
  } catch (error) {
    console.error('Error in process objectives GET:', error);
    return NextResponse.json(
      { error: 'Error al obtener objetivos del proceso' },
      { status: 500 }
    );
  }
}
