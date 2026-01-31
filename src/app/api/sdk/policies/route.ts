/**
 * Policies API Route - SDK Unified
 *
 * GET /api/sdk/policies - List policies
 * POST /api/sdk/policies - Create policy
 */

import { PoliciaService } from '@/lib/sdk/modules/policies';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const service = new PoliciaService();
    const policies = await service.list({}, { limit, offset });

    return NextResponse.json(
      { data: policies, count: policies.length },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/sdk/policies:', error);
    return NextResponse.json(
      {
        error: 'Error al obtener políticas',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const service = new PoliciaService();
    const id = await service.create(body, 'system');

    return NextResponse.json(
      { id, message: 'Política creada exitosamente' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/sdk/policies:', error);
    return NextResponse.json(
      {
        error: 'Error al crear política',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
