import { NextRequest, NextResponse } from 'next/server';
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '@/firebase/config';

// GET - Obtener todas las tarjetas de un registro
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Obtener todas las listas del registro
    const listsRef = collection(db, 'processRecords', id, 'kanbanLists');
    const listsSnapshot = await getDocs(listsRef);

    const allCards = [];

    for (const listDoc of listsSnapshot.docs) {
      const cardsRef = collection(listDoc.ref, 'cards');
      const cardsSnapshot = await getDocs(cardsRef);

      const cards = cardsSnapshot.docs.map(cardDoc => ({
        id: cardDoc.id,
        listId: listDoc.id,
        ...cardDoc.data(),
      }));

      allCards.push(...cards);
    }

    return NextResponse.json({
      success: true,
      data: allCards,
      count: allCards.length,
    });
  } catch (error) {
    console.error('Error fetching kanban cards:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener tarjetas del Kanban' },
      { status: 500 }
    );
  }
}

// POST - Crear nueva tarjeta
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const {
      title,
      description,
      listId,
      assignedTo,
      dueDate,
      priority = 'medium',
      tags = [],
      createdBy,
    } = body;

    if (!title || !listId) {
      return NextResponse.json(
        { success: false, error: 'Título y lista son requeridos' },
        { status: 400 }
      );
    }

    const cardData = {
      title,
      description: description || '',
      listId,
      assignedTo: assignedTo || null,
      dueDate: dueDate || null,
      priority,
      tags,
      status: 'pending',
      createdBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const cardRef = await addDoc(
      collection(db, 'processRecords', id, 'kanbanLists', listId, 'cards'),
      cardData
    );

    // Actualizar estadísticas del registro
    await updateRecordStats(id);

    return NextResponse.json({
      success: true,
      data: {
        id: cardRef.id,
        ...cardData,
      },
      message: 'Tarjeta creada exitosamente',
    });
  } catch (error) {
    console.error('Error creating kanban card:', error);
    return NextResponse.json(
      { success: false, error: 'Error al crear tarjeta del Kanban' },
      { status: 500 }
    );
  }
}

// Función auxiliar para actualizar estadísticas del registro
async function updateRecordStats(recordId: string) {
  try {
    const listsRef = collection(db, 'processRecords', recordId, 'kanbanLists');
    const listsSnapshot = await getDocs(listsRef);

    let totalCards = 0;
    let pendingCards = 0;
    let inProgressCards = 0;
    let completedCards = 0;

    for (const listDoc of listsSnapshot.docs) {
      const cardsRef = collection(listDoc.ref, 'cards');
      const cardsSnapshot = await getDocs(cardsRef);

      totalCards += cardsSnapshot.size;

      // Contar por estado (esto depende de cómo definas los estados en tus listas)
      const listData = listDoc.data();
      if (listData.title?.toLowerCase().includes('pendiente')) {
        pendingCards += cardsSnapshot.size;
      } else if (listData.title?.toLowerCase().includes('progreso')) {
        inProgressCards += cardsSnapshot.size;
      } else if (listData.title?.toLowerCase().includes('completado')) {
        completedCards += cardsSnapshot.size;
      }
    }

    await updateDoc(doc(db, 'processRecords', recordId), {
      'kanbanStats.totalCards': totalCards,
      'kanbanStats.pendingCards': pendingCards,
      'kanbanStats.inProgressCards': inProgressCards,
      'kanbanStats.completedCards': completedCards,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating record stats:', error);
  }
}
