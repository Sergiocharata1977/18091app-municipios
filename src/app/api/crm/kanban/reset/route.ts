/**
 * API Route para RESETEAR estados Kanban del CRM
 * Elimina estados antiguos y crea los nuevos
 */

import { ESTADOS_KANBAN_DEFAULT } from '@/data/crm/scoring-config';
import { db } from '@/firebase/config';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
} from 'firebase/firestore';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const estadosRef = collection(db, 'kanban_estados');

    // 1. Eliminar todos los estados existentes
    const snapshot = await getDocs(estadosRef);
    console.log(`Eliminando ${snapshot.size} estados antiguos...`);

    for (const docSnap of snapshot.docs) {
      await deleteDoc(doc(db, 'kanban_estados', docSnap.id));
    }

    // 2. Crear nuevos estados
    const now = new Date().toISOString();
    const estadosCreados: any[] = [];

    for (const estadoDefault of ESTADOS_KANBAN_DEFAULT) {
      const estadoData = {
        ...estadoDefault,
        created_at: now,
        updated_at: now,
      };

      const docRef = await addDoc(estadosRef, estadoData);
      estadosCreados.push({ id: docRef.id, ...estadoData });
    }

    return NextResponse.json({
      success: true,
      message: 'Estados Kanban actualizados correctamente',
      data: {
        estados_eliminados: snapshot.size,
        estados_creados: estadosCreados.length,
        nuevos_estados: estadosCreados.map(e => e.nombre),
      },
    });
  } catch (error: any) {
    console.error('Error reseteando estados Kanban:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to reset Kanban states',
      },
      { status: 500 }
    );
  }
}
