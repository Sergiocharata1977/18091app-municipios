import { OrganigramaService } from '@/services/organigramas/OrganigramaService';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const organigrama = await OrganigramaService.getById(id);

    if (!organigrama) {
      return NextResponse.json(
        { error: 'Organigrama no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(organigrama);
  } catch (error) {
    console.error('Error fetching organigrama:', error);
    return NextResponse.json(
      { error: 'Error al obtener organigrama' },
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
    await OrganigramaService.update(id, data, userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating organigrama:', error);
    return NextResponse.json(
      { error: 'Error al actualizar organigrama' },
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
    await OrganigramaService.delete(id, userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting organigrama:', error);
    return NextResponse.json(
      { error: 'Error al eliminar organigrama' },
      { status: 500 }
    );
  }
}
