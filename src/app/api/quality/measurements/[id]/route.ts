import { getAdminFirestore } from '@/lib/firebase/admin';
import { measurementSchema } from '@/lib/validations/quality';
import { Timestamp } from 'firebase-admin/firestore';
import { NextRequest, NextResponse } from 'next/server';

const COLLECTION_NAME = 'quality_measurements';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getAdminFirestore();
    const doc = await db.collection(COLLECTION_NAME).doc(id).get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Medición no encontrada' },
        { status: 404 }
      );
    }

    const data = doc.data()!;
    return NextResponse.json({
      id: doc.id,
      ...data,
      created_at: data.created_at?.toDate?.().toISOString() || data.created_at,
      updated_at: data.updated_at?.toDate?.().toISOString() || data.updated_at,
      measurement_date: data.measurement_date,
    });
  } catch (error) {
    console.error('Error in measurement GET:', error);
    return NextResponse.json(
      { error: 'Error al obtener medición' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = measurementSchema.partial().parse(body);

    const db = getAdminFirestore();
    await db
      .collection(COLLECTION_NAME)
      .doc(id)
      .update({
        ...validatedData,
        updated_at: Timestamp.now(),
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in measurement PUT:', error);

    if (
      error &&
      typeof error === 'object' &&
      'name' in error &&
      error.name === 'ZodError'
    ) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: (error as any).errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al actualizar medición' },
      { status: 500 }
    );
  }
}

// Alias PATCH para compatibilidad con inline editing
export const PATCH = PUT;

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getAdminFirestore();

    // Soft delete
    await db.collection(COLLECTION_NAME).doc(id).update({
      is_active: false,
      updated_at: Timestamp.now(),
    });

    return NextResponse.json({
      message: 'Medición eliminada exitosamente',
    });
  } catch (error) {
    console.error('Error in measurement DELETE:', error);
    return NextResponse.json(
      { error: 'Error al eliminar medición' },
      { status: 500 }
    );
  }
}
