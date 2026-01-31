import { ReunionTrabajoService } from '@/services/reuniones-trabajo/ReunionTrabajoService';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const reunion = await ReunionTrabajoService.getById(id);

    if (!reunion) {
      return NextResponse.json(
        { error: 'Reunión no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(reunion);
  } catch (error) {
    console.error('Error fetching reunion:', error);
    return NextResponse.json(
      { error: 'Error al obtener reunión' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const data = await request.json();
    const userId = data.updated_by || 'system';
    await ReunionTrabajoService.update(id, data, userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating reunion:', error);
    return NextResponse.json(
      { error: 'Error al actualizar reunión' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const userId = 'system'; // TODO: Get from auth
    await ReunionTrabajoService.delete(id, userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting reunion:', error);
    return NextResponse.json(
      { error: 'Error al eliminar reunión' },
      { status: 500 }
    );
  }
}
