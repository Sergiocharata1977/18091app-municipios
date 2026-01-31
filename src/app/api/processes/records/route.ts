import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';

// GET - Obtener todos los registros de procesos
export async function GET() {
  try {
    const recordsRef = collection(db, 'processRecords');
    const snapshot = await getDocs(recordsRef);

    const records = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      data: records,
      count: records.length,
    });
  } catch (error) {
    console.error('Error fetching process records:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener registros de procesos' },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo registro de proceso
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      name,
      description,
      processDefinitionId,
      processDefinitionName,
      status = 'activo',
      createdBy,
    } = body;

    // Validaciones básicas
    if (!name || !description || !processDefinitionId) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    const recordData = {
      name,
      description,
      processDefinitionId,
      processDefinitionName,
      status,
      createdBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      kanbanStats: {
        totalCards: 0,
        pendingCards: 0,
        inProgressCards: 0,
        completedCards: 0,
      },
      isActive: true,
    };

    const docRef = await addDoc(collection(db, 'processRecords'), recordData);

    return NextResponse.json({
      success: true,
      data: {
        id: docRef.id,
        ...recordData,
      },
      message: 'Registro de proceso creado exitosamente',
    });
  } catch (error) {
    console.error('Error creating process record:', error);
    return NextResponse.json(
      { success: false, error: 'Error al crear registro de proceso' },
      { status: 500 }
    );
  }
}
