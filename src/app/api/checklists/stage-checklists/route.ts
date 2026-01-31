import { adminDb } from '@/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const COLLECTION_NAME = 'stageChecklists';

async function getOrganizationId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('organization_id')?.value || null;
}

// GET /api/checklists/stage-checklists - Get checklist by stage_id and process_record_id
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stageId = searchParams.get('stage_id');
    const processRecordId = searchParams.get('process_record_id');

    if (!stageId || !processRecordId) {
      return NextResponse.json(
        { error: 'Se requiere stage_id y process_record_id' },
        { status: 400 }
      );
    }

    const snapshot = await adminDb
      .collection(COLLECTION_NAME)
      .where('stage_id', '==', stageId)
      .where('process_record_id', '==', processRecordId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json(null);
    }

    const doc = snapshot.docs[0];
    const data = doc.data();
    return NextResponse.json({
      id: doc.id,
      ...data,
      created_at: data.created_at?.toDate?.()?.toISOString(),
      updated_at: data.updated_at?.toDate?.()?.toISOString(),
    });
  } catch (error) {
    console.error('Error getting stage checklist:', error);
    return NextResponse.json(
      { error: 'Error al obtener checklist' },
      { status: 500 }
    );
  }
}

// POST /api/checklists/stage-checklists - Create new stage checklist
export async function POST(request: NextRequest) {
  try {
    const organizationId = await getOrganizationId();
    const body = await request.json();
    const { stage_id, process_record_id, nombre, campos } = body;

    if (!stage_id || !process_record_id) {
      return NextResponse.json(
        { error: 'Se requiere stage_id y process_record_id' },
        { status: 400 }
      );
    }

    const now = Timestamp.now();
    const docRef = await adminDb.collection(COLLECTION_NAME).add({
      stage_id,
      process_record_id,
      organization_id: organizationId,
      nombre: nombre || `Checklist`,
      campos: campos || [],
      created_at: now,
      updated_at: now,
    });

    console.log('[StageChecklist] Created:', docRef.id);
    return NextResponse.json(
      { id: docRef.id, message: 'Checklist creado exitosamente' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating stage checklist:', error);
    return NextResponse.json(
      { error: 'Error al crear checklist' },
      { status: 500 }
    );
  }
}

// PUT /api/checklists/stage-checklists - Update stage checklist
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, stage_id, process_record_id, nombre, campos } = body;

    if (!id) {
      return NextResponse.json({ error: 'Se requiere id' }, { status: 400 });
    }

    const docRef = adminDb.collection(COLLECTION_NAME).doc(id);
    await docRef.update({
      nombre: nombre || `Checklist`,
      campos: campos || [],
      updated_at: Timestamp.now(),
    });

    console.log('[StageChecklist] Updated:', id);
    return NextResponse.json({
      id,
      message: 'Checklist actualizado exitosamente',
    });
  } catch (error) {
    console.error('Error updating stage checklist:', error);
    return NextResponse.json(
      { error: 'Error al actualizar checklist' },
      { status: 500 }
    );
  }
}
