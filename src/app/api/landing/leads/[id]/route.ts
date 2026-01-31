// API para gestionar un lead individual
import { NextRequest, NextResponse } from 'next/server';

import { adminDb as db } from '@/firebase/admin';

// GET - Obtener lead por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const docRef = db.collection('landing_leads').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { success: false, error: 'Lead no encontrado' },
        { status: 404 }
      );
    }

    const leadData = {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data()?.createdAt?.toDate(),
      updatedAt: doc.data()?.updatedAt?.toDate(),
      lastMessageAt: doc.data()?.lastMessageAt?.toDate(),
      chatHistory:
        doc.data()?.chatHistory?.map((msg: any) => ({
          ...msg,
          timestamp: msg.timestamp?.toDate(),
        })) || [],
    };

    return NextResponse.json({
      success: true,
      data: leadData,
    });
  } catch (error: any) {
    console.error('Error fetching lead:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Actualizar lead (cambiar estado, agregar notas, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const docRef = db.collection('landing_leads').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { success: false, error: 'Lead no encontrado' },
        { status: 404 }
      );
    }

    await docRef.update({
      ...body,
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: 'Lead actualizado correctamente',
    });
  } catch (error: any) {
    console.error('Error updating lead:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar lead
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const docRef = db.collection('landing_leads').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { success: false, error: 'Lead no encontrado' },
        { status: 404 }
      );
    }

    await docRef.delete();

    return NextResponse.json({
      success: true,
      message: 'Lead eliminado correctamente',
    });
  } catch (error: any) {
    console.error('Error deleting lead:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
