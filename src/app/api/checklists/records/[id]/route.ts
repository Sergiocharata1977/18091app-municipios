import { ChecklistRecordServiceAdmin } from '@/services/checklists/ChecklistRecordServiceAdmin';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

async function getUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('user_id')?.value || null;
}

async function getUserName(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('user_name')?.value || null;
}

// GET /api/checklists/records/[id] - Get record by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const record = await ChecklistRecordServiceAdmin.getById(id);

    if (!record) {
      return NextResponse.json(
        { error: 'Checklist no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(record);
  } catch (error) {
    console.error('Error getting record:', error);
    return NextResponse.json(
      { error: 'Error al obtener checklist' },
      { status: 500 }
    );
  }
}

// PATCH /api/checklists/records/[id] - Update record (answers, complete, cancel)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'update_answer':
        await ChecklistRecordServiceAdmin.updateAnswer(
          id,
          data.campo_id,
          data.answer
        );
        break;

      case 'update_all_answers':
        await ChecklistRecordServiceAdmin.updateAllAnswers(id, data.respuestas);
        break;

      case 'complete':
        const userId = (await getUserId()) || 'unknown';
        const userName = (await getUserName()) || 'Usuario';
        await ChecklistRecordServiceAdmin.complete(
          id,
          userId,
          userName,
          data.observaciones
        );
        break;

      case 'cancel':
        await ChecklistRecordServiceAdmin.cancel(id);
        break;

      default:
        return NextResponse.json(
          { error: 'Acción no válida' },
          { status: 400 }
        );
    }

    return NextResponse.json({ message: 'Checklist actualizado exitosamente' });
  } catch (error) {
    console.error('Error updating record:', error);
    return NextResponse.json(
      { error: 'Error al actualizar checklist' },
      { status: 500 }
    );
  }
}

// DELETE /api/checklists/records/[id] - Delete record
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await ChecklistRecordServiceAdmin.delete(id);

    return NextResponse.json({ message: 'Checklist eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting record:', error);
    return NextResponse.json(
      { error: 'Error al eliminar checklist' },
      { status: 500 }
    );
  }
}
