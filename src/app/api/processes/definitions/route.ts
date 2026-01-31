import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';

// GET - Obtener todas las definiciones de procesos
export async function GET() {
  try {
    const definitionsRef = collection(db, 'processDefinitions');
    const snapshot = await getDocs(definitionsRef);

    const definitions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      data: definitions,
      count: definitions.length,
    });
  } catch (error) {
    console.error('Error fetching process definitions:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener definiciones de procesos' },
      { status: 500 }
    );
  }
}

// POST - Crear nueva definición de proceso
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      name,
      description,
      category,
      responsible,
      department,
      version,
      status = 'activo',
      createdBy,
    } = body;

    // Validaciones básicas
    if (!name || !description || !responsible) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    const definitionData = {
      name,
      description,
      category: category || 'general',
      responsible,
      department: department || null,
      version: version || '1.0',
      status,
      createdBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
    };

    const docRef = await addDoc(
      collection(db, 'processDefinitions'),
      definitionData
    );

    return NextResponse.json({
      success: true,
      data: {
        id: docRef.id,
        ...definitionData,
      },
      message: 'Definición de proceso creada exitosamente',
    });
  } catch (error) {
    console.error('Error creating process definition:', error);
    return NextResponse.json(
      { success: false, error: 'Error al crear definición de proceso' },
      { status: 500 }
    );
  }
}
