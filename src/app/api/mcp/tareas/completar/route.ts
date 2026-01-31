/**
 * API MCP - Completar Tarea
 * POST /api/mcp/tareas/completar
 */

import { markTaskCompleted } from '@/services/mcp';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const CompleteTaskSchema = z.object({
  organization_id: z.string().min(1, 'organization_id es requerido'),
  user_id: z.string().min(1, 'user_id es requerido'),
  tarea_id: z.string().optional(),
  hallazgo_id: z.string().optional(),
  accion_id: z.string().optional(),

  tipo: z.enum([
    'facturacion',
    'formulario',
    'extraccion',
    'carga_datos',
    'otro',
  ]),
  sistema_origen: z.string().min(1, 'sistema_origen es requerido'),
  url_origen: z.string().url('URL de origen inválida'),
  comando_original: z.string().optional(),

  estado: z.enum(['exitoso', 'fallido', 'parcial', 'pendiente']),
  duracion_ms: z.number().min(0),
  log_pasos: z.array(
    z.object({
      orden: z.number().optional(),
      accion: z.string(),
      selector: z.string().optional(),
      valor: z.string().optional(),
      resultado: z.enum(['ok', 'error', 'skipped']),
      error_mensaje: z.string().optional(),
      duracion_ms: z.number().optional(),
    })
  ),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar datos
    const validationResult = CompleteTaskSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Datos inválidos',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Completar tarea
    const result = await markTaskCompleted(data);

    return NextResponse.json({
      success: true,
      data: {
        execution_id: result.execution_id,
      },
    });
  } catch (error: any) {
    console.error('[API /mcp/tareas/completar] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error interno del servidor',
      },
      { status: 500 }
    );
  }
}
