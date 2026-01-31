import { getAdminFirestore } from '@/lib/firebase/admin';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const processId = searchParams.get('process_id');

    if (!processId) {
      return NextResponse.json(
        { error: 'process_id is required' },
        { status: 400 }
      );
    }

    const db = getAdminFirestore();

    // Obtener todos los objetivos de este proceso
    const snapshot = await db
      .collection('quality_objectives')
      .where('process_definition_id', '==', processId)
      .get();

    // Extraer números de los códigos existentes
    const existingNumbers: number[] = [];
    snapshot.forEach(doc => {
      const code = doc.data().code;
      if (code) {
        // Extraer el número del formato OBJ-COMER-0001
        const match = code.match(/-(\d+)$/);
        if (match) {
          existingNumbers.push(parseInt(match[1], 10));
        }
      }
    });

    // Calcular el siguiente número
    const nextNumber =
      existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;

    return NextResponse.json({ nextNumber });
  } catch (error: any) {
    console.error('Error getting next code:', error);
    return NextResponse.json(
      { error: error.message || 'Error getting next code' },
      { status: 500 }
    );
  }
}
