import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

// GET - Verificar estado de las colecciones
export async function GET() {
  try {
    // Verificar definiciones de procesos
    const definitionsSnapshot = await getDocs(
      collection(db, 'processDefinitions')
    );
    const definitionsCount = definitionsSnapshot.size;

    // Verificar registros de procesos
    const recordsSnapshot = await getDocs(collection(db, 'processRecords'));
    const recordsCount = recordsSnapshot.size;

    // Verificar listas Kanban (solo del primer registro si existe)
    let kanbanListsCount = 0;
    let kanbanCardsCount = 0;

    if (recordsCount > 0) {
      const firstRecord = recordsSnapshot.docs[0];
      const listsSnapshot = await getDocs(
        collection(db, 'processRecords', firstRecord.id, 'kanbanLists')
      );
      kanbanListsCount = listsSnapshot.size;

      // Contar tarjetas en todas las listas
      for (const listDoc of listsSnapshot.docs) {
        const cardsSnapshot = await getDocs(
          collection(
            db,
            'processRecords',
            firstRecord.id,
            'kanbanLists',
            listDoc.id,
            'cards'
          )
        );
        kanbanCardsCount += cardsSnapshot.size;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        processDefinitions: {
          count: definitionsCount,
          status: definitionsCount > 0 ? 'populated' : 'empty',
        },
        processRecords: {
          count: recordsCount,
          status: recordsCount > 0 ? 'populated' : 'empty',
        },
        kanbanLists: {
          count: kanbanListsCount,
          status: kanbanListsCount > 0 ? 'populated' : 'empty',
        },
        kanbanCards: {
          count: kanbanCardsCount,
          status: kanbanCardsCount > 0 ? 'populated' : 'empty',
        },
      },
      summary: {
        totalDefinitions: definitionsCount,
        totalRecords: recordsCount,
        totalKanbanLists: kanbanListsCount,
        totalKanbanCards: kanbanCardsCount,
        overallStatus:
          definitionsCount > 0 && recordsCount > 0 ? 'ready' : 'needs_seeding',
      },
    });
  } catch (error) {
    console.error('Error checking collections:', error);
    return NextResponse.json(
      { success: false, error: 'Error al verificar colecciones' },
      { status: 500 }
    );
  }
}
