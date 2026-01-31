import { getAdminFirestore } from '@/lib/firebase/admin';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const COLLECTION_NAME = 'quality_measurements';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const indicatorId = searchParams.get('indicator_id');
    const measurementDate = searchParams.get('measurement_date');

    if (!indicatorId) {
      return NextResponse.json(
        { error: 'indicator_id es requerido' },
        { status: 400 }
      );
    }

    if (!measurementDate) {
      return NextResponse.json(
        { error: 'measurement_date es requerido' },
        { status: 400 }
      );
    }

    // Get indicator to extract its code
    const db = getAdminFirestore();
    const indicatorDoc = await db
      .collection('quality_indicators')
      .doc(indicatorId)
      .get();

    if (!indicatorDoc.exists) {
      return NextResponse.json(
        { error: 'Indicador no encontrado' },
        { status: 404 }
      );
    }

    const indicatorData = indicatorDoc.data()!;
    const indicatorCode = indicatorData.code;

    // Format date as YYYYMMDD
    const date = new Date(measurementDate);
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');

    // Generate code: MED-[CODIGO_INDICADOR]-[YYYYMMDD]
    const code = `MED-${indicatorCode}-${dateStr}`;

    // Check if code already exists
    const existingSnapshot = await db
      .collection(COLLECTION_NAME)
      .where('code', '==', code)
      .get();

    if (existingSnapshot.empty) {
      // Code doesn't exist, return it
      return NextResponse.json({ code, nextNumber: 1 });
    } else {
      // Code exists, add suffix
      const count = existingSnapshot.size;
      const suffixedCode = `${code}-${String(count + 1).padStart(3, '0')}`;
      return NextResponse.json({ code: suffixedCode, nextNumber: count + 1 });
    }
  } catch (error) {
    console.error('Error generating measurement code:', error);
    return NextResponse.json(
      { error: 'Error al generar código de medición' },
      { status: 500 }
    );
  }
}
