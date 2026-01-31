import { ChecklistTemplateServiceAdmin } from '@/services/checklists/ChecklistTemplateServiceAdmin';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/checklists/templates/[id] - Get template by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const template = await ChecklistTemplateServiceAdmin.getById(id);

    if (!template) {
      return NextResponse.json(
        { error: 'Plantilla no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error('Error getting template:', error);
    return NextResponse.json(
      { error: 'Error al obtener plantilla' },
      { status: 500 }
    );
  }
}

// PATCH /api/checklists/templates/[id] - Update template
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    await ChecklistTemplateServiceAdmin.update(id, body);

    return NextResponse.json({ message: 'Plantilla actualizada exitosamente' });
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json(
      { error: 'Error al actualizar plantilla' },
      { status: 500 }
    );
  }
}

// DELETE /api/checklists/templates/[id] - Delete or deactivate template
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get('permanent') === 'true';

    if (permanent) {
      await ChecklistTemplateServiceAdmin.delete(id);
    } else {
      await ChecklistTemplateServiceAdmin.deactivate(id);
    }

    return NextResponse.json({ message: 'Plantilla eliminada exitosamente' });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { error: 'Error al eliminar plantilla' },
      { status: 500 }
    );
  }
}
