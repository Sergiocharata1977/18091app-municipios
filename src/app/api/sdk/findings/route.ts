/**
 * Finding API Routes - SDK Unified
 *
 * GET /api/sdk/findings - List findings
 * POST /api/sdk/findings - Create finding
 */

import { NextRequest, NextResponse } from 'next/server';
import { FindingService } from '@/lib/sdk/modules/findings';
import { CreateFindingSchema } from '@/lib/sdk/modules/findings/validations';
import type { FindingStatus } from '@/lib/sdk/modules/findings/types';

// GET /api/sdk/findings - List findings with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Extract filters from query parameters
    const filters = {
      status: (searchParams.get('status') as FindingStatus) || undefined,
      processId: searchParams.get('processId') || undefined,
      sourceId: searchParams.get('sourceId') || undefined,
      year: searchParams.get('year')
        ? parseInt(searchParams.get('year')!)
        : undefined,
      search: searchParams.get('search') || undefined,
      requiresAction: searchParams.get('requiresAction')
        ? searchParams.get('requiresAction') === 'true'
        : undefined,
    };

    // Extract pagination options
    const options = {
      limit: searchParams.get('limit')
        ? parseInt(searchParams.get('limit')!)
        : 100,
      offset: searchParams.get('offset')
        ? parseInt(searchParams.get('offset')!)
        : 0,
    };

    // Initialize service and list findings
    const service = new FindingService();
    const findings = await service.list(filters, options);

    return NextResponse.json({
      findings,
      count: findings.length,
    });
  } catch (error) {
    console.error('Error in GET /api/sdk/findings:', error);
    return NextResponse.json(
      {
        error: 'Error al obtener hallazgos',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST /api/sdk/findings - Create finding
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate data using SDK schema
    const validatedData = CreateFindingSchema.parse(body);

    // Get user ID from request (should come from auth middleware)
    const userId = body.userId || 'system';

    // Initialize service and create finding
    const service = new FindingService();
    const findingId = await service.createAndReturnId(validatedData, userId);

    return NextResponse.json(
      {
        id: findingId,
        message: 'Hallazgo creado exitosamente',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/sdk/findings:', error);

    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Error al crear hallazgo',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
