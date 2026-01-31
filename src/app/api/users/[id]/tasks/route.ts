import { auth } from '@/lib/auth';
import { createUserTask, getUserTasks } from '@/services/user-tasks';
import type { UserPrivateTaskFormData } from '@/types/private-sections';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/users/[id]/tasks
 * Obtiene todas las tareas del usuario
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

    // Verificar autenticación
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Solo el usuario o admin puede ver sus tareas
    const isOwner = session.user.id === userId;
    const isAdmin = session.user.rol === 'admin';

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    // Obtener filtros de query params
    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get('status')?.split(',');
    const priorityFilter = searchParams.get('priority')?.split(',');
    const typeFilter = searchParams.get('type')?.split(',');

    const filters: any = {};
    if (statusFilter) filters.status = statusFilter;
    if (priorityFilter) filters.priority = priorityFilter;
    if (typeFilter) filters.type = typeFilter;

    const tasks = await getUserTasks(userId, filters);

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Error al obtener tareas:', error);
    return NextResponse.json(
      { error: 'Error al obtener tareas' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users/[id]/tasks
 * Crea una nueva tarea
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

    // Verificar autenticación
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Solo el usuario puede crear sus propias tareas
    if (session.user.id !== userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const data: UserPrivateTaskFormData = await req.json();

    // Validar datos requeridos
    if (!data.title) {
      return NextResponse.json(
        { error: 'El título es requerido' },
        { status: 400 }
      );
    }

    const taskId = await createUserTask(userId, data);

    return NextResponse.json({ id: taskId }, { status: 201 });
  } catch (error) {
    console.error('Error al crear tarea:', error);
    return NextResponse.json(
      { error: 'Error al crear tarea' },
      { status: 500 }
    );
  }
}
