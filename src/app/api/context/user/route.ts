/**
 * User Context API Route
 *
 * GET /api/context/user - Get complete user context for IA
 * GET /api/context/user?light=true - Get lightweight user context
 */

import { UserContextService } from '@/services/context/UserContextService';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const light = searchParams.get('light') === 'true';
    const refresh = searchParams.get('refresh') === 'true';

    if (!userId) {
      return NextResponse.json(
        { error: 'userId parameter is required' },
        { status: 400 }
      );
    }

    let context;

    if (refresh) {
      // Refresh context (invalidate cache)
      context = await UserContextService.refreshContext(userId);
    } else if (light) {
      // Get lightweight context
      context = await UserContextService.getUserContextLight(userId);
    } else {
      // Get full context
      context = await UserContextService.getUserFullContext(userId);
    }

    return NextResponse.json({ data: context }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/context/user:', error);
    return NextResponse.json(
      {
        error: 'Error al obtener contexto del usuario',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
