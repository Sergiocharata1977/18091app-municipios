import { NormPointRelationService } from '@/services/normPoints/NormPointRelationService';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const relations = await NormPointRelationService.getAll();
    return NextResponse.json(relations);
  } catch (error) {
    console.error('Error getting norm point relations:', error);
    return NextResponse.json(
      { error: 'Error al obtener relaciones de puntos de norma' },
      { status: 500 }
    );
  }
}
