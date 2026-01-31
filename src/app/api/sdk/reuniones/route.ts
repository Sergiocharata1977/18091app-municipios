/**
 * Reuniones API Route - SDK Unified
 *
 * GET /api/sdk/reuniones - List reuniones
 * POST /api/sdk/reuniones - Create reunion
 */

import { NextRequest, NextResponse } from 'next/server';
import { ReunionTrabajoService } from '@/lib/sdk/modules/reuniones';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const service = new ReunionTrabajoService();
    const reuniones = await service.list({}, { limit, offset });

    return NextResponse.json(
      { data: reuniones, count: reuniones.length },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/sdk/reuniones:', error);
    return NextResponse.json(
      {
        error: 'Error al obtener reuniones',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const service = new ReunionTrabajoService();
    const id = await service.create(body, 'system');

    return NextResponse.json(
      { id, message: 'Reunión creada exitosamente' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/sdk/reuniones:', error);
    return NextResponse.json(
      {
        error: 'Error al crear reunión',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
