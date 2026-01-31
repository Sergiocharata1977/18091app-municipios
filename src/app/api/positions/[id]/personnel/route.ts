import { NextRequest, NextResponse } from 'next/server';
import { PositionService } from '@/services/rrhh/PositionService';

// GET /api/positions/[id]/personnel - Obtener personal en un puesto
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const personnel = await PositionService.getPersonnelInPosition(id);

    return NextResponse.json(personnel);
  } catch (error) {
    console.error('Error getting personnel in position:', error);
    return NextResponse.json(
      { error: 'Error al obtener personal del puesto' },
      { status: 500 }
    );
  }
}
