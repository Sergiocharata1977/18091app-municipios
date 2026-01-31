/**
 * API MCP - Subir Evidencia
 * POST /api/mcp/evidencias
 *
 * REFACTOR: Usando Firebase Admin SDK para Storage
 */

import { getAdminStorage } from '@/lib/firebase/admin';
import { addEvidenceToExecution } from '@/services/mcp';
import { Timestamp } from 'firebase-admin/firestore'; // Usar Timestamp de Admin
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const UploadEvidenceSchema = z.object({
  organization_id: z.string().min(1, 'organization_id es requerido'),
  execution_id: z.string().min(1, 'execution_id es requerido'),
  tipo: z.enum(['screenshot', 'pdf', 'xlsx', 'log']),
  data_base64: z.string().min(1, 'data_base64 es requerido'),
  descripcion: z.string().min(1, 'descripcion es requerida'),
  filename: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar datos
    const validationResult = UploadEvidenceSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Datos inválidos',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Decodificar base64
    const buffer = Buffer.from(data.data_base64, 'base64');

    // Generar nombre de archivo
    const extension = getExtension(data.tipo);
    const filename =
      data.filename || `mcp_${data.execution_id}_${Date.now()}.${extension}`;

    // Subir a Firebase Storage (Admin SDK)
    const storagePath = `mcp/${data.organization_id}/${data.execution_id}/${filename}`;
    const bucket = getAdminStorage().bucket();
    const file = bucket.file(storagePath);

    await file.save(buffer, {
      metadata: {
        contentType: getContentType(data.tipo),
      },
    });

    // Hacer el archivo público para obtener una URL accesible (o usar signedUrl)
    // Para simplificar integración, intentaremos hacerlo público.
    // Si falla por permisos de bucket, usaremos signedUrl.
    let downloadUrl = '';

    try {
      await file.makePublic();
      downloadUrl = file.publicUrl();
    } catch {
      // Fallback: Signed URL (valida por 1 año)
      const [signedUrl] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + 1000 * 60 * 60 * 24 * 365, // 1 año
      });
      downloadUrl = signedUrl;
    }

    // Agregar evidencia a la ejecución
    // Nota: addEvidenceToExecution ya usa Admin SDK internamente
    await addEvidenceToExecution(data.execution_id, {
      tipo: data.tipo as any,
      url: downloadUrl,
      descripcion: data.descripcion,
      timestamp: Timestamp.now().toDate(), // Timestamp de Admin convertido a Date
      size_bytes: buffer.length,
    });

    return NextResponse.json({
      success: true,
      data: {
        evidence_url: downloadUrl,
        filename,
      },
    });
  } catch (error: any) {
    console.error('[API /mcp/evidencias] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error interno del servidor',
      },
      { status: 500 }
    );
  }
}

function getExtension(tipo: string): string {
  switch (tipo) {
    case 'screenshot':
      return 'png';
    case 'pdf':
      return 'pdf';
    case 'xlsx':
      return 'xlsx';
    case 'log':
      return 'txt';
    default:
      return 'bin';
  }
}

function getContentType(tipo: string): string {
  switch (tipo) {
    case 'screenshot':
      return 'image/png';
    case 'pdf':
      return 'application/pdf';
    case 'xlsx':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case 'log':
      return 'text/plain';
    default:
      return 'application/octet-stream';
  }
}
