import { adminDb } from '@/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';
import { NextRequest, NextResponse } from 'next/server';

const COLLECTION_NAME = 'checklist_task_executions';

// GET /api/checklists/task-executions - Get execution for a task
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('task_id');
    const checklistId = searchParams.get('checklist_id');

    if (!taskId || !checklistId) {
      return NextResponse.json(
        { error: 'task_id y checklist_id son requeridos' },
        { status: 400 }
      );
    }

    const snapshot = await adminDb
      .collection(COLLECTION_NAME)
      .where('task_id', '==', taskId)
      .where('checklist_id', '==', checklistId)
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
      completado_at: data.completado_at?.toDate?.() || null,
      created_at: data.created_at?.toDate?.() || new Date(),
      updated_at: data.updated_at?.toDate?.() || new Date(),
    });
  } catch (error) {
    console.error('Error getting task execution:', error);
    return NextResponse.json(
      { error: 'Error al obtener ejecución del checklist' },
      { status: 500 }
    );
  }
}

// POST /api/checklists/task-executions - Create new execution
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { task_id, checklist_id, respuestas, estado } = body;

    if (!task_id || !checklist_id) {
      return NextResponse.json(
        { error: 'task_id y checklist_id son requeridos' },
        { status: 400 }
      );
    }

    const now = Timestamp.now();
    const docData: any = {
      task_id,
      checklist_id,
      respuestas: respuestas || {},
      estado: estado || 'pendiente',
      created_at: now,
      updated_at: now,
    };

    if (estado === 'completado') {
      docData.completado_at = now;
    }

    const docRef = await adminDb.collection(COLLECTION_NAME).add(docData);

    console.log('[Task Execution] Created:', docRef.id);
    return NextResponse.json(
      { id: docRef.id, message: 'Ejecución creada exitosamente' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating task execution:', error);
    return NextResponse.json(
      { error: 'Error al crear ejecución del checklist' },
      { status: 500 }
    );
  }
}

// PUT /api/checklists/task-executions - Update execution
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, respuestas, estado } = body;

    if (!id) {
      return NextResponse.json({ error: 'id es requerido' }, { status: 400 });
    }

    const now = Timestamp.now();
    const updateData: any = {
      respuestas,
      estado: estado || 'pendiente',
      updated_at: now,
    };

    if (estado === 'completado') {
      updateData.completado_at = now;
    }

    await adminDb.collection(COLLECTION_NAME).doc(id).update(updateData);

    console.log('[Task Execution] Updated:', id);
    return NextResponse.json({
      id,
      message: 'Ejecución actualizada exitosamente',
    });
  } catch (error) {
    console.error('Error updating task execution:', error);
    return NextResponse.json(
      { error: 'Error al actualizar ejecución del checklist' },
      { status: 500 }
    );
  }
}
