import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';

// GET - Obtener registro específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const docRef = doc(db, 'processRecords', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json(
        { success: false, error: 'Registro de proceso no encontrado' },
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
    console.error('Error fetching process record:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener registro de proceso' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar registro
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

    const docRef = doc(db, 'processRecords', id);
    await updateDoc(docRef, updateData);

    return NextResponse.json({
      success: true,
      message: 'Registro de proceso actualizado exitosamente',
    });
  } catch (error) {
    console.error('Error updating process record:', error);
    return NextResponse.json(
      { success: false, error: 'Error al actualizar registro de proceso' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar registro
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const docRef = doc(db, 'processRecords', id);
    await deleteDoc(docRef);

    return NextResponse.json({
      success: true,
      message: 'Registro de proceso eliminado exitosamente',
    });
  } catch (error) {
    console.error('Error deleting process record:', error);
    return NextResponse.json(
      { success: false, error: 'Error al eliminar registro de proceso' },
      { status: 500 }
    );
  }
}
