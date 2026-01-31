import { auth } from '@/lib/auth';
import { deleteUserTask, updateUserTask } from '@/services/user-tasks';
import type { UserPrivateTaskFormData } from '@/types/private-sections';
import { NextRequest, NextResponse } from 'next/server';

/**
 * PATCH /api/users/[id]/tasks/[taskId]
 * Actualiza una tarea
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
    const { id: userId, taskId } = await params;

    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    if (session.user.id !== userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const data: Partial<UserPrivateTaskFormData> = await req.json();

    await updateUserTask(userId, taskId, data);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al actualizar tarea:', error);
    return NextResponse.json(
      { error: 'Error al actualizar tarea' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/users/[id]/tasks/[taskId]
 * Elimina una tarea
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
    const { id: userId, taskId } = await params;

    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    if (session.user.id !== userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    await deleteUserTask(userId, taskId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar tarea:', error);
    return NextResponse.json(
      { error: 'Error al eliminar tarea' },
      { status: 500 }
    );
  }
}
