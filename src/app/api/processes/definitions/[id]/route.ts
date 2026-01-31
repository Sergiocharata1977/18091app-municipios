import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';

// GET - Obtener definición específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const docRef = doc(db, 'processDefinitions', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json(
        { success: false, error: 'Definición de proceso no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: docSnap.id,
        ...docSnap.data(),
      },
    });
  } catch (error) {
    console.error('Error fetching process definition:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener definición de proceso' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar definición
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updateData = {
      ...body,
      updatedAt: new Date().toISOString(),
    };

    const docRef = doc(db, 'processDefinitions', id);
    await updateDoc(docRef, updateData);

    return NextResponse.json({
      success: true,
      message: 'Definición de proceso actualizada exitosamente',
    });
  } catch (error) {
    console.error('Error updating process definition:', error);
    return NextResponse.json(
      { success: false, error: 'Error al actualizar definición de proceso' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar definición
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const docRef = doc(db, 'processDefinitions', id);
    await deleteDoc(docRef);

    return NextResponse.json({
      success: true,
      message: 'Definición de proceso eliminada exitosamente',
    });
  } catch (error) {
    console.error('Error deleting process definition:', error);
    return NextResponse.json(
      { success: false, error: 'Error al eliminar definición de proceso' },
      { status: 500 }
    );
  }
}
