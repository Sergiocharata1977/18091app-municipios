/**
 * Action API Routes - SDK Unified
 *
 * GET /api/sdk/actions - List actions
 * POST /api/sdk/actions - Create action
 */

import { NextRequest, NextResponse } from 'next/server';
import { ActionService } from '@/lib/sdk/modules/actions';
import { CreateActionSchema } from '@/lib/sdk/modules/actions/validations';
import type { ActionFilters } from '@/lib/sdk/modules/actions/types';

// GET /api/sdk/actions - List actions with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Extract filters from query parameters
    const filters: ActionFilters = {
      status: (searchParams.get('status') as any) || undefined,
      responsibleId: searchParams.get('responsibleId') || undefined,
      findingId: searchParams.get('findingId') || undefined,
      search: searchParams.get('search') || undefined,
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

    // Initialize service and list actions
    const service = new ActionService();
    const actions = await service.list(filters, options);

    return NextResponse.json({
      actions,
      count: actions.length,
    });
  } catch (error) {
    console.error('Error in GET /api/sdk/actions:', error);
    return NextResponse.json(
      {
        error: 'Error al obtener acciones',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST /api/sdk/actions - Create action
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate data using SDK schema
    const validatedData = CreateActionSchema.parse(body);

    // Get user ID from request (should come from auth middleware)
    const userId = body.userId || 'system';

    // Initialize service and create action
    const service = new ActionService();
    const actionId = await service.createAndReturnId(validatedData, userId);

    return NextResponse.json(
      {
        id: actionId,
        message: 'Acción creada exitosamente',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/sdk/actions:', error);

    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Error al crear acción',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
