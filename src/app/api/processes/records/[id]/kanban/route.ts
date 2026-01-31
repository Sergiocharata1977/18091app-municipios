import { NextRequest, NextResponse } from 'next/server';
import { collection, doc, getDocs, addDoc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';

// GET - Obtener tablero Kanban específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Obtener el registro de proceso
    const recordRef = doc(db, 'processRecords', id);
    const recordDoc = await getDoc(recordRef);

    if (!recordDoc.exists()) {
      return NextResponse.json(
        { success: false, error: 'Registro de proceso no encontrado' },
        { status: 404 }
      );
    }

    // Obtener las listas del Kanban
    const listsRef = collection(db, 'processRecords', id, 'kanbanLists');
    const listsSnapshot = await getDocs(listsRef);

    const lists = listsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Obtener las tarjetas de cada lista
    const listsWithCards = await Promise.all(
      lists.map(async list => {
        const cardsRef = collection(
          db,
          'processRecords',
          id,
          'kanbanLists',
          list.id,
          'cards'
        );
        const cardsSnapshot = await getDocs(cardsRef);

        const cards = cardsSnapshot.docs.map(cardDoc => ({
          id: cardDoc.id,
          ...cardDoc.data(),
        }));

        return {
          ...list,
          cards,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        record: {
          id: recordDoc.id,
          ...recordDoc.data(),
        },
        lists: listsWithCards,
      },
    });
  } catch (error) {
    console.error('Error fetching kanban board:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener tablero Kanban' },
      { status: 500 }
    );
  }
}

// POST - Crear nueva lista en el Kanban
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { title, description, color = 'bg-gray-100', position } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, error: 'El título de la lista es requerido' },
        { status: 400 }
      );
    }

    const listData = {
      title,
      description: description || '',
      color,
      position: position || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const listRef = await addDoc(
      collection(db, 'processRecords', id, 'kanbanLists'),
      listData
    );

    return NextResponse.json({
      success: true,
      data: {
        id: listRef.id,
        ...listData,
      },
      message: 'Lista creada exitosamente',
    });
  } catch (error) {
    console.error('Error creating kanban list:', error);
    return NextResponse.json(
      { success: false, error: 'Error al crear lista del Kanban' },
      { status: 500 }
    );
  }
}
