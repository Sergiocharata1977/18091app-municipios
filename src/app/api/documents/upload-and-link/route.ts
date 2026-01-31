/**
 * API: Upload and Link Document
 * POST /api/documents/upload-and-link
 *
 * Sube un archivo y lo vincula a una entidad en un solo paso
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
    console.error('[API] Error en upload-and-link:', error);
    return NextResponse.json(
      { error: 'Error al subir y vincular documento' },
      { status: 500 }
    );
  }
}
