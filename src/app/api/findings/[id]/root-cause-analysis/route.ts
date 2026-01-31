import { FindingRootCauseAnalysisSchema } from '@/lib/validations/findings';
import { FindingService } from '@/services/findings/FindingService';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/findings/[id]/root-cause-analysis
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validar datos
    const validatedData = FindingRootCauseAnalysisSchema.parse(body);

    // Actualizar análisis
    await FindingService.updateRootCauseAnalysis(
      id,
      validatedData,
      'system',
      body.userName || 'Usuario'
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(
      'Error in POST /api/findings/[id]/root-cause-analysis:',
      error
    );
    return NextResponse.json(
      { error: 'Error al actualizar análisis' },
      { status: 500 }
    );
  }
}
