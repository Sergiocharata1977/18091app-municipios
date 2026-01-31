/**
 * API Route: /api/crm/kanban/estados
 * Gestión de estados del Kanban
 */

import { CreateEstadoKanbanSchema } from '@/lib/schemas/crm-schemas';
import { KanbanServiceAdmin } from '@/services/crm/KanbanServiceAdmin';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organization_id');

    if (!organizationId) {
      return NextResponse.json(
        { success: false, error: 'organization_id es requerido' },
        { status: 400 }
      );
    }

    const estados = await KanbanServiceAdmin.getEstados(organizationId);

    return NextResponse.json({
      success: true,
      data: estados,
      count: estados.length,
    });
  } catch (error: any) {
    console.error('Error in GET /api/crm/kanban/estados:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch estados',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar datos
    const validatedData = CreateEstadoKanbanSchema.parse(body);

    // Crear estado
    const estado = await KanbanServiceAdmin.crearEstado(validatedData);

    return NextResponse.json(
      {
        success: true,
        data: estado,
        message: 'Estado creado exitosamente',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error in POST /api/crm/kanban/estados:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create estado',
      },
      { status: 500 }
    );
  }
}
