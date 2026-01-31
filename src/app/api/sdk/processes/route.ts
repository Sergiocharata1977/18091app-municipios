/**
 * Processes API Route - SDK Unified
 *
 * GET /api/sdk/processes - List processes
 * POST /api/sdk/processes - Create process
 */

import { NextRequest, NextResponse } from 'next/server';
import { ProcessService } from '@/lib/sdk/modules/processes';
import { CreateProcessSchema } from '@/lib/sdk/modules/processes/validations';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const service = new ProcessService();
    const processes = await service.list({}, { limit, offset });

    return NextResponse.json(
      { data: processes, count: processes.length },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/sdk/processes:', error);
    return NextResponse.json(
      {
        error: 'Error al obtener procesos',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = CreateProcessSchema.parse(body);

    const service = new ProcessService();
    const id = await service.createAndReturnId(validated, 'system');

    return NextResponse.json(
      { id, message: 'Proceso creado exitosamente' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/sdk/processes:', error);
    return NextResponse.json(
      {
        error: 'Error al crear proceso',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
