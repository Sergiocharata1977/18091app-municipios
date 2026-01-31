import { FindingService } from '@/services/findings/FindingService';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/findings/[id]/close
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    await FindingService.close(id, 'system', body.userName || 'Usuario');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in POST /api/findings/[id]/close:', error);
    return NextResponse.json(
      { error: 'Error al cerrar hallazgo' },
      { status: 500 }
    );
  }
}
