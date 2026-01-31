import { ChecklistTemplateServiceAdmin } from '@/services/checklists/ChecklistTemplateServiceAdmin';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// POST /api/checklists/templates/[id]/fields - Add field to template
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Generate field ID if not provided
    const field = {
      id: body.id || uuidv4(),
      orden: body.orden ?? 0,
      tipo: body.tipo || 'texto',
      etiqueta: body.etiqueta || '',
      descripcion: body.descripcion || '',
      requerido: body.requerido ?? false,
      opciones: body.opciones || [],
      valor_esperado: body.valor_esperado || '',
      valor_minimo: body.valor_minimo,
      valor_maximo: body.valor_maximo,
      unidad: body.unidad || '',
    };

    await ChecklistTemplateServiceAdmin.addField(id, field);

    return NextResponse.json(
      { id: field.id, message: 'Campo agregado exitosamente' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding field:', error);
    return NextResponse.json(
      { error: 'Error al agregar campo' },
      { status: 500 }
    );
  }
}
