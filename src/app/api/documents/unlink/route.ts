/**
 * API: Unlink Document
 * DELETE /api/documents/unlink
 *
 * Desvincula un documento de una entidad
 *
 * TODO: Este endpoint necesita DocumentIntegrationService refactorizado
 */

import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(request: NextRequest) {
  try {
    return NextResponse.json(
      {
        success: false,
        message: 'Endpoint temporalmente deshabilitado - en refactorización',
      },
      { status: 503 }
    );
  } catch (error) {
    console.error('[API] Error en unlink:', error);
    return NextResponse.json(
      { error: 'Error al desvincular documento' },
      { status: 500 }
    );
  }
}
