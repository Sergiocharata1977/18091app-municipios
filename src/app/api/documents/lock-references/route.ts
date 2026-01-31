/**
 * API: Lock References
 * POST /api/documents/lock-references
 *
 * Bloquea todas las referencias de una entidad (ISO 9001 compliance)
 *
 * TODO: Este endpoint necesita DocumentIntegrationService refactorizado
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    return NextResponse.json(
      {
        success: false,
        message: 'Endpoint temporalmente deshabilitado - en refactorización',
      },
      { status: 503 }
    );
  } catch (error) {
    console.error('[API] Error en lock-references:', error);
    return NextResponse.json(
      { error: 'Error al bloquear referencias' },
      { status: 500 }
    );
  }
}
