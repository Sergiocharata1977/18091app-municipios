import { db } from '@/firebase/config';
import { collection, doc, getDocs, writeBatch } from 'firebase/firestore';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const normPointsRef = collection(db, 'normPoints');

    // Obtener todos los puntos
    const snapshot = await getDocs(normPointsRef);

    // Agrupar por código
    const pointsByCode = new Map<string, string[]>();

    snapshot.docs.forEach(docSnap => {
      const code = docSnap.data().code;
      if (!pointsByCode.has(code)) {
        pointsByCode.set(code, []);
      }
      pointsByCode.get(code)!.push(docSnap.id);
    });

    // Eliminar duplicados (mantener solo el primero)
    let deletedCount = 0;
    const batch = writeBatch(db);

    pointsByCode.forEach((ids, code) => {
      if (ids.length > 1) {
        // Mantener el primero, eliminar el resto
        ids.slice(1).forEach(id => {
          batch.delete(doc(db, 'normPoints', id));
          deletedCount++;
        });
      }
    });

    if (deletedCount > 0) {
      await batch.commit();
    }

    return NextResponse.json({
      message: 'Duplicados eliminados exitosamente',
      deletedCount,
      uniquePoints: pointsByCode.size,
    });
  } catch (error) {
    console.error('Error cleaning up duplicates:', error);
    return NextResponse.json(
      {
        error: 'Error al eliminar duplicados',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
