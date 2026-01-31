// src/app/api/crm/estados-financieros/situacion/[id]/route.ts
// API para operaciones sobre Estado de Situación Patrimonial individual

import { EstadosFinancierosService } from '@/services/crm/EstadosFinancierosService';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const estado =
      await EstadosFinancierosService.getSituacionPatrimonialById(id);

    if (!estado) {
      return NextResponse.json(
        { success: false, error: 'Estado no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: estado,
    });
  } catch (error: unknown) {
    console.error(
      'Error in GET /api/crm/estados-financieros/situacion/[id]:',
      error
    );
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

    await EstadosFinancierosService.updateSituacionPatrimonial(id, body);

    return NextResponse.json({
      success: true,
      message: 'Estado actualizado',
    });
  } catch (error: unknown) {
    console.error(
      'Error in PATCH /api/crm/estados-financieros/situacion/[id]:',
      error
    );
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
    await EstadosFinancierosService.deleteSituacionPatrimonial(id);

    return NextResponse.json({
      success: true,
      message: 'Estado eliminado',
    });
  } catch (error: unknown) {
    console.error(
      'Error in DELETE /api/crm/estados-financieros/situacion/[id]:',
      error
    );
    return NextResponse.json(
      { success: false, error: 'Error al eliminar' },
      { status: 500 }
    );
  }
}
