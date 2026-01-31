/**
 * API MCP - Listar Tareas Pendientes
 * GET /api/mcp/tareas
 */

import { getTasksForUser } from '@/services/mcp';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const QuerySchema = z.object({
  organization_id: z.string().min(1, 'organization_id es requerido'),
  user_id: z.string().min(1, 'user_id es requerido'),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = {
      organization_id: searchParams.get('organization_id'),
      user_id: searchParams.get('user_id'),
    };

    // Validar parámetros
    const validationResult = QuerySchema.safeParse(params);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Parámetros inválidos',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { organization_id, user_id } = validationResult.data;

    // Obtener tareas
    const result = await getTasksForUser(organization_id, user_id);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('[API /mcp/tareas] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error interno del servidor',
      },
      { status: 500 }
    );
  }
}
