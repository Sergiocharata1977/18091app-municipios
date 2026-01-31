/**
 * API Route: /api/crm/clientes/[id]
 * Operaciones sobre un cliente específico
 */

import { UpdateClienteCRMSchema } from '@/lib/schemas/crm-schemas';
import { ClienteCRMServiceAdmin } from '@/services/crm/ClienteCRMServiceAdmin';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cliente = await ClienteCRMServiceAdmin.getById(params.id);

    if (!cliente) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cliente no encontrado',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: cliente,
    });
  } catch (error: any) {
    console.error('Error in GET /api/crm/clientes/[id]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch cliente',
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Validar datos
    const validatedData = UpdateClienteCRMSchema.parse(body);

    // TODO: Obtener userId del usuario autenticado
    const userId = 'current-user-id';

    // Actualizar cliente
    await ClienteCRMServiceAdmin.update(params.id, validatedData, userId);

    // Obtener cliente actualizado
    const cliente = await ClienteCRMServiceAdmin.getById(params.id);

    return NextResponse.json({
      success: true,
      data: cliente,
      message: 'Cliente actualizado exitosamente',
    });
  } catch (error: any) {
    console.error('Error in PATCH /api/crm/clientes/[id]:', error);

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
        error: error.message || 'Failed to update cliente',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Obtener userId del usuario autenticado
    const userId = 'current-user-id';

    await ClienteCRMServiceAdmin.delete(params.id, userId);

    return NextResponse.json({
      success: true,
      message: 'Cliente eliminado exitosamente',
    });
  } catch (error: any) {
    console.error('Error in DELETE /api/crm/clientes/[id]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to delete cliente',
      },
      { status: 500 }
    );
  }
}
