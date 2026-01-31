// src/app/api/crm/oportunidades/route.ts
// API Routes para gestión de oportunidades CRM

import { OportunidadesService } from '@/services/crm/OportunidadesService';
import { NextRequest, NextResponse } from 'next/server';

// Forzar ruta dinámica - no ejecutar durante build
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organization_id');
    const estadoKanbanId = searchParams.get('estado_kanban_id');
    const vendedorId = searchParams.get('vendedor_id');
    const crmOrganizacionId = searchParams.get('crm_organizacion_id');

    console.log('[API /crm/oportunidades] GET request:', { organizationId });

    if (!organizationId) {
      return NextResponse.json(
        { success: false, error: 'organization_id es requerido' },
        { status: 400 }
      );
    }

    const oportunidades = await OportunidadesService.listar(organizationId, {
      estado_kanban_id: estadoKanbanId || undefined,
      vendedor_id: vendedorId || undefined,
      crm_organizacion_id: crmOrganizacionId || undefined,
    });

    console.log(
      '[API /crm/oportunidades] Found:',
      oportunidades.length,
      'opportunities'
    );

    return NextResponse.json({
      success: true,
      data: oportunidades,
    });
  } catch (error: unknown) {
    console.error('Error in GET /api/crm/oportunidades:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      { success: false, error: 'Error interno', details: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.organization_id || !body.nombre || !body.crm_organizacion_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'organization_id, nombre y crm_organizacion_id son requeridos',
        },
        { status: 400 }
      );
    }

    const oportunidad = await OportunidadesService.crear(
      body.organization_id,
      body.user_id || 'sistema',
      {
        nombre: body.nombre,
        descripcion: body.descripcion,
        crm_organizacion_id: body.crm_organizacion_id,
        organizacion_nombre: body.organizacion_nombre,
        organizacion_cuit: body.organizacion_cuit,
        contacto_id: body.contacto_id,
        contacto_nombre: body.contacto_nombre,
        vendedor_id: body.vendedor_id,
        vendedor_nombre: body.vendedor_nombre,
        estado_kanban_id: body.estado_kanban_id,
        estado_kanban_nombre: body.estado_kanban_nombre,
        estado_kanban_color: body.estado_kanban_color,
        monto_estimado: body.monto_estimado,
        probabilidad: body.probabilidad,
        fecha_cierre_estimada: body.fecha_cierre_estimada,
        productos_interes: body.productos_interes,
      }
    );

    return NextResponse.json({
      success: true,
      data: oportunidad,
    });
  } catch (error: unknown) {
    console.error('Error in POST /api/crm/oportunidades:', error);
    return NextResponse.json(
      { success: false, error: 'Error al crear oportunidad' },
      { status: 500 }
    );
  }
}
