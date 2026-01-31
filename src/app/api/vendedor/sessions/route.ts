// src/app/api/vendedor/sessions/route.ts
// API para gestionar sesiones de trabajo

import { workSessionService } from '@/services/vendedor/WorkSessionService';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      action,
      organization_id,
      vendedor_id,
      vendedor_nombre,
      vendedor_email,
      session_id,
      ubicacion,
    } = body;

    if (!organization_id || !vendedor_id) {
      return NextResponse.json(
        { error: 'organization_id y vendedor_id son requeridos' },
        { status: 400 }
      );
    }

    if (action === 'start') {
      const session = await workSessionService.startSession({
        organization_id,
        vendedor_id,
        vendedor_nombre,
        vendedor_email,
        ubicacion,
      });

      return NextResponse.json({ success: true, session });
    }

    if (action === 'end') {
      if (!session_id) {
        return NextResponse.json(
          { error: 'session_id es requerido para finalizar' },
          { status: 400 }
        );
      }

      await workSessionService.endSession(
        organization_id,
        session_id,
        ubicacion
      );
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'Acción no válida. Use "start" o "end"' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('[WorkSessionAPI] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organization_id = searchParams.get('organization_id');
    const vendedor_id = searchParams.get('vendedor_id');
    const type = searchParams.get('type') || 'active';

    if (!organization_id) {
      return NextResponse.json(
        { error: 'organization_id es requerido' },
        { status: 400 }
      );
    }

    // Obtener sesión activa de un vendedor específico
    if (vendedor_id && type === 'active') {
      const session = await workSessionService.getActiveSession(
        organization_id,
        vendedor_id
      );
      return NextResponse.json({ session });
    }

    // Obtener historial de un vendedor
    if (vendedor_id && type === 'history') {
      const sessions = await workSessionService.getVendedorHistory(
        organization_id,
        vendedor_id
      );
      return NextResponse.json({ sessions });
    }

    // Obtener todas las sesiones activas (para supervisor)
    if (type === 'all_active') {
      const sessions =
        await workSessionService.getActiveSessions(organization_id);
      return NextResponse.json({ sessions });
    }

    // Obtener resumen para supervisor
    if (type === 'summary') {
      const summary =
        await workSessionService.getSupervisorSummary(organization_id);
      return NextResponse.json({ summary });
    }

    return NextResponse.json({ sessions: [] });
  } catch (error: any) {
    console.error('[WorkSessionAPI] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno' },
      { status: 500 }
    );
  }
}
