// src/app/api/vendedor/evidencias/foto/route.ts
// API para subir fotos de visitas

import { adminStorage } from '@/firebase/admin';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/vendedor/evidencias/foto
 * Sube una foto al Storage y retorna la URL
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const metadataStr = formData.get('metadata') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó archivo' },
        { status: 400 }
      );
    }

    const metadata = metadataStr ? JSON.parse(metadataStr) : {};
    const { organizationId, visitaId, clienteId, id } = metadata;

    if (!organizationId || !visitaId || !clienteId) {
      return NextResponse.json(
        { error: 'Faltan datos de metadata' },
        { status: 400 }
      );
    }

    // Convertir File a Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ruta en Storage
    const fileName = `${id || Date.now()}.jpg`;
    const storagePath = `organizations/${organizationId}/visitas/${visitaId}/fotos/${fileName}`;

    // Subir a Firebase Storage
    const bucket = adminStorage.bucket();
    const fileRef = bucket.file(storagePath);

    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type || 'image/jpeg',
        metadata: {
          organizationId,
          visitaId,
          clienteId,
          uploadedAt: new Date().toISOString(),
          ...metadata,
        },
      },
    });

    // Hacer el archivo público (opcional, según tus necesidades de seguridad)
    // await fileRef.makePublic();

    // Obtener URL firmada (válida por 7 días)
    const [url] = await fileRef.getSignedUrl({
      action: 'read',
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 días
    });

    return NextResponse.json({
      success: true,
      url,
      storagePath,
      fileName,
    });
  } catch (error) {
    console.error('Error al subir foto:', error);
    return NextResponse.json(
      {
        error: 'Error al subir foto',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
