// src/app/api/crm/contactos/route.ts
// API para gestión de contactos del CRM

import { ContactoCRMService } from '@/services/crm/ContactoCRMService';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organization_id');
    const crmOrganizacionId = searchParams.get('crm_organizacion_id');

    if (!organizationId) {
      return NextResponse.json(
        { success: false, error: 'organization_id es requerido' },
        { status: 400 }
      );
    }

    let contactos;
    if (crmOrganizacionId) {
      contactos = await ContactoCRMService.getByOrganizacionCRM(
        organizationId,
        crmOrganizacionId
      );
    } else {
      contactos = await ContactoCRMService.getByOrganization(organizationId);
    }

    return NextResponse.json({
      success: true,
      data: contactos,
    });
  } catch (error: any) {
    console.error('Error in GET /api/crm/contactos:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get contactos' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.organization_id) {
      return NextResponse.json(
        { success: false, error: 'organization_id es requerido' },
        { status: 400 }
      );
    }

    if (!body.nombre || !body.telefono) {
      return NextResponse.json(
        { success: false, error: 'nombre y telefono son requeridos' },
        { status: 400 }
      );
    }

    const contacto = await ContactoCRMService.create(body.organization_id, {
      nombre: body.nombre,
      apellido: body.apellido,
      email: body.email,
      telefono: body.telefono,
      whatsapp: body.whatsapp || body.telefono, // Default whatsapp = telefono
      cargo: body.cargo,
      empresa: body.empresa,
      crm_organizacion_id: body.crm_organizacion_id,
      notas: body.notas,
    });

    return NextResponse.json({
      success: true,
      data: contacto,
    });
  } catch (error: any) {
    console.error('Error in POST /api/crm/contactos:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create contacto' },
      { status: 500 }
    );
  }
}
