/**
 * API: Link Existing Document
 * POST /api/documents/link-existing
 *
 * Vincula un documento existente a una nueva entidad sin duplicar archivo
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
    console.error('[API] Error en link-existing:', error);
    return NextResponse.json(
      { error: 'Error al vincular documento' },
      { status: 500 }
    );
  }
}
