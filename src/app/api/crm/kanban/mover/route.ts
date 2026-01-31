/**
 * API Route: /api/crm/kanban/mover
 * Mover cliente entre estados del Kanban
 */

import { MoverClienteKanbanSchema } from '@/lib/schemas/crm-schemas';
import { ClienteCRMService } from '@/services/crm/ClienteCRMService';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar datos
    const validatedData = MoverClienteKanbanSchema.parse(body);

    // Mover cliente
    await ClienteCRMService.moverEstado(validatedData);

    // Obtener cliente actualizado
    const cliente = await ClienteCRMService.getById(validatedData.cliente_id);

    return NextResponse.json({
      success: true,
      data: cliente,
      message: 'Cliente movido exitosamente',
    });
  } catch (error: any) {
    console.error('Error in POST /api/crm/kanban/mover:', error);

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
        error: error.message || 'Failed to mover cliente',
      },
      { status: 500 }
    );
  }
}
