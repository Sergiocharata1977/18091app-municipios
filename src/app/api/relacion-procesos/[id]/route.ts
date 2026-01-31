import { RelacionProcesosService } from '@/services/relacion-procesos/RelacionProcesosService';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const relacion = await RelacionProcesosService.getById(id);

    if (!relacion) {
      return NextResponse.json(
        { error: 'Relación no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(relacion);
  } catch (error) {
    console.error('Error fetching relacion:', error);
    return NextResponse.json(
      { error: 'Error al obtener relación' },
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
    await RelacionProcesosService.update(id, data, userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating relacion:', error);
    return NextResponse.json(
      { error: 'Error al actualizar relación' },
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
    await RelacionProcesosService.delete(id, userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting relacion:', error);
    return NextResponse.json(
      { error: 'Error al eliminar relación' },
      { status: 500 }
    );
  }
}
