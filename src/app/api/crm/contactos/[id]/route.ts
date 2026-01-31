// src/app/api/crm/contactos/[id]/route.ts
// API para operaciones sobre un contacto específico

import { ContactoCRMService } from '@/services/crm/ContactoCRMService';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contacto = await ContactoCRMService.getById(params.id);

    if (!contacto) {
      return NextResponse.json(
        { success: false, error: 'Contacto no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: contacto,
    });
  } catch (error: any) {
    console.error('Error in GET /api/crm/contactos/[id]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get contacto' },
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

    await ContactoCRMService.update(params.id, body);

    const contacto = await ContactoCRMService.getById(params.id);

    return NextResponse.json({
      success: true,
      data: contacto,
    });
  } catch (error: any) {
    console.error('Error in PATCH /api/crm/contactos/[id]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update contacto' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await ContactoCRMService.delete(params.id);

    return NextResponse.json({
      success: true,
      message: 'Contacto eliminado exitosamente',
    });
  } catch (error: any) {
    console.error('Error in DELETE /api/crm/contactos/[id]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete contacto' },
      { status: 500 }
    );
  }
}
