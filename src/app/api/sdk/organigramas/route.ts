/**
 * Organigramas API Route - SDK Unified
 *
 * GET /api/sdk/organigramas - List organigramas
 * POST /api/sdk/organigramas - Create organigrama
 */

import { OrganigramaService } from '@/lib/sdk/modules/organigramas';
import { CreateOrganigramaSchema } from '@/lib/sdk/modules/organigramas/validations';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const service = new OrganigramaService();
    const organigramas = await service.list({}, { limit, offset });

    return NextResponse.json(
      { data: organigramas, count: organigramas.length },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/sdk/organigramas:', error);
    return NextResponse.json(
      {
        error: 'Error al obtener organigramas',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = CreateOrganigramaSchema.parse(body);

    const service = new OrganigramaService();
    const id = await service.create(validated, 'system');

    return NextResponse.json(
      { id, message: 'Organigrama creado exitosamente' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/sdk/organigramas:', error);
    return NextResponse.json(
      {
        error: 'Error al crear organigrama',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
