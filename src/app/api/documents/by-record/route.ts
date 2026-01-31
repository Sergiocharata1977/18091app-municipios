/**
 * API: Get Documents by Record
 * GET /api/documents/by-record?module=audits&recordId=xxx&linkType=evidence
 *
 * Obtiene todos los documentos vinculados a una entidad
 *
 * TODO: Este endpoint necesita DocumentIntegrationService refactorizado
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Endpoint temporalmente deshabilitado
    // El DocumentIntegrationService necesita ser refactorizado para usar
    // Firebase Admin SDK correctamente

    return NextResponse.json(
      {
        success: true,
        references: [],
        count: 0,
        message: 'Endpoint temporalmente deshabilitado - en refactorización',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API] Error en by-record:', error);
    return NextResponse.json(
      { error: 'Error al obtener documentos' },
      { status: 500 }
    );
  }
}
