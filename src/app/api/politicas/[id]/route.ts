import { PoliticaService } from '@/services/politicas/PoliticaService';
import { NextRequest, NextResponse } from 'next/server';

const politicaService = new PoliticaService();

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const politica = await PoliticaService.getById(id);

    if (!politica) {
      return NextResponse.json(
        { error: 'Política no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(politica);
  } catch (error) {
    console.error('Error fetching politica:', error);
    return NextResponse.json(
      { error: 'Error al obtener política' },
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
    // TODO: Obtener userId del contexto de autenticación
    const userId = 'system-user'; // Placeholder temporal
    const politica = await PoliticaService.update(id, data, userId);
    return NextResponse.json(politica);
  } catch (error) {
    console.error('Error updating politica:', error);
    return NextResponse.json(
      { error: 'Error al actualizar política' },
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
    // TODO: Obtener userId del contexto de autenticación
    const userId = 'system-user'; // Placeholder temporal
    await PoliticaService.delete(id, userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting politica:', error);
    return NextResponse.json(
      { error: 'Error al eliminar política' },
      { status: 500 }
    );
  }
}
