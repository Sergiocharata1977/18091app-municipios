// src/app/api/crm/oportunidades/[id]/route.ts
// API Routes para operaciones individuales de oportunidades

import { OportunidadesService } from '@/services/crm/OportunidadesService';
import { NextRequest, NextResponse } from 'next/server';

// Forzar ruta dinámica
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const oportunidad = await OportunidadesService.obtener(id);

    if (!oportunidad) {
      return NextResponse.json(
        { success: false, error: 'Oportunidad no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: oportunidad,
    });
  } catch (error: unknown) {
    console.error('Error in GET /api/crm/oportunidades/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const oportunidad = await OportunidadesService.actualizar(id, body);

    return NextResponse.json({
      success: true,
      data: oportunidad,
    });
  } catch (error: unknown) {
    console.error('Error in PATCH /api/crm/oportunidades/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Error al actualizar' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await OportunidadesService.eliminar(id);

    return NextResponse.json({
      success: true,
      message: 'Oportunidad eliminada',
    });
  } catch (error: unknown) {
    console.error('Error in DELETE /api/crm/oportunidades/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Error al eliminar' },
      { status: 500 }
    );
  }
}
