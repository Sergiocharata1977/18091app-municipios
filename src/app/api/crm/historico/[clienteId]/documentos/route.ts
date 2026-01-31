/**
 * API Route: /api/crm/historico/[clienteId]/documentos
 * Gestión de documentos versionados
 */

import { HistoricoService } from '@/services/crm/HistoricoService';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { clienteId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const soloActuales = searchParams.get('actuales') !== 'false';

    const documentos = await HistoricoService.getDocumentos(
      params.clienteId,
      soloActuales
    );

    return NextResponse.json({
      success: true,
      data: documentos,
      count: documentos.length,
    });
  } catch (error: any) {
    console.error(
      'Error in GET /api/crm/historico/[clienteId]/documentos:',
      error
    );
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get documentos' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { clienteId: string } }
) {
  try {
    const body = await request.json();

    if (!body.organizationId) {
      return NextResponse.json(
        { success: false, error: 'organizationId es requerido' },
        { status: 400 }
      );
    }

    if (!body.documentoBaseId || !body.nombreArchivo || !body.storageUrl) {
      return NextResponse.json(
        {
          success: false,
          error: 'documentoBaseId, nombreArchivo y storageUrl son requeridos',
        },
        { status: 400 }
      );
    }

    if (!body.subidoPor?.userId || !body.subidoPor?.nombre) {
      return NextResponse.json(
        { success: false, error: 'subidoPor (userId, nombre) es requerido' },
        { status: 400 }
      );
    }

    const documentoId = await HistoricoService.addDocumentoVersion(
      body.organizationId,
      params.clienteId,
      {
        documentoBaseId: body.documentoBaseId,
        nombreArchivo: body.nombreArchivo,
        tipoDocumento: body.tipoDocumento || 'otro',
        descripcion: body.descripcion,
        storageUrl: body.storageUrl,
        tamaño: body.tamaño || 0,
        mimeType: body.mimeType || 'application/octet-stream',
        fechaDocumento: body.fechaDocumento,
        fechaCarga: new Date().toISOString(),
      },
      body.subidoPor
    );

    return NextResponse.json({
      success: true,
      data: { id: documentoId },
      message: 'Documento versionado exitosamente',
    });
  } catch (error: any) {
    console.error(
      'Error in POST /api/crm/historico/[clienteId]/documentos:',
      error
    );
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to add documento' },
      { status: 500 }
    );
  }
}
