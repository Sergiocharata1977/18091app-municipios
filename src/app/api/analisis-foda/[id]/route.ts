import { AnalisisFODAService } from '@/services/analisis-foda/AnalisisFODAService';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const analisis = await AnalisisFODAService.getById(id);

    if (!analisis) {
      return NextResponse.json(
        { error: 'Análisis FODA no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(analisis);
  } catch (error) {
    console.error('Error fetching analisis FODA:', error);
    return NextResponse.json(
      { error: 'Error al obtener análisis FODA' },
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
    await AnalisisFODAService.update(id, data, userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating analisis FODA:', error);
    return NextResponse.json(
      { error: 'Error al actualizar análisis FODA' },
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
    await AnalisisFODAService.delete(id, userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting analisis FODA:', error);
    return NextResponse.json(
      { error: 'Error al eliminar análisis FODA' },
      { status: 500 }
    );
  }
}
