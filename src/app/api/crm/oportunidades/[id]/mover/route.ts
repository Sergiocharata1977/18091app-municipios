// src/app/api/crm/oportunidades/[id]/mover/route.ts
// API para mover oportunidad entre estados Kanban

import { OportunidadesService } from '@/services/crm/OportunidadesService';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!body.estado_nuevo_id || !body.estado_nuevo_nombre) {
      return NextResponse.json(
        {
          success: false,
          error: 'estado_nuevo_id y estado_nuevo_nombre son requeridos',
        },
        { status: 400 }
      );
    }

    const oportunidad = await OportunidadesService.moverEstado({
      oportunidad_id: id,
      estado_nuevo_id: body.estado_nuevo_id,
      estado_nuevo_nombre: body.estado_nuevo_nombre,
      estado_nuevo_color: body.estado_nuevo_color || '#6b7280',
      usuario_id: body.usuario_id || 'sistema',
      usuario_nombre: body.usuario_nombre,
      motivo: body.motivo,
    });

    return NextResponse.json({
      success: true,
      data: oportunidad,
    });
  } catch (error: unknown) {
    console.error('Error in POST /api/crm/oportunidades/[id]/mover:', error);
    return NextResponse.json(
      { success: false, error: 'Error al mover oportunidad' },
      { status: 500 }
    );
  }
}
