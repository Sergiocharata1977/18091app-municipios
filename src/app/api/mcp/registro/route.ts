/**
 * API MCP - Registrar Ejecución
 * POST /api/mcp/registro
 *
 * Registra una ejecución ad-hoc (sin tarea previa asociada)
 */

import { registerExecution } from '@/services/mcp';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const RegisterExecutionSchema = z.object({
  organization_id: z.string().min(1, 'organization_id es requerido'),
  user_id: z.string().min(1, 'user_id es requerido'),

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

  // Evidencia inline opcional
  evidencia_base64: z.string().optional(),
  evidencia_tipo: z.enum(['screenshot', 'pdf', 'xlsx', 'log']).optional(),
  evidencia_descripcion: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar datos
    const validationResult = RegisterExecutionSchema.safeParse(body);
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

    // Registrar ejecución
    const result = await registerExecution(data);

    return NextResponse.json({
      success: true,
      data: {
        execution_id: result.execution_id,
      },
    });
  } catch (error: any) {
    console.error('[API /mcp/registro] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error interno del servidor',
      },
      { status: 500 }
    );
  }
}
