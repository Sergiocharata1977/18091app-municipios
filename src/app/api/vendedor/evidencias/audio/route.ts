// src/app/api/vendedor/evidencias/audio/route.ts
// API para subir audios de visitas y transcribirlos

import { adminStorage } from '@/firebase/admin';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/vendedor/evidencias/audio
 * Sube un audio al Storage y opcionalmente lo transcribe
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
    const fileName = `${id || Date.now()}.webm`;
    const storagePath = `organizations/${organizationId}/visitas/${visitaId}/audios/${fileName}`;

    // Subir a Firebase Storage
    const bucket = adminStorage.bucket();
    const fileRef = bucket.file(storagePath);

    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type || 'audio/webm',
        metadata: {
          organizationId,
          visitaId,
          clienteId,
          uploadedAt: new Date().toISOString(),
          duracionSegundos: metadata.duracionSegundos,
          ...metadata,
        },
      },
    });

    // Obtener URL firmada
    const [url] = await fileRef.getSignedUrl({
      action: 'read',
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 días
    });

    // TODO: Integrar con Whisper para transcripción
    // Por ahora retornamos la transcripción existente si la hay
    const transcripcion = metadata.transcripcion || null;

    return NextResponse.json({
      success: true,
      url,
      storagePath,
      fileName,
      transcripcion,
    });
  } catch (error) {
    console.error('Error al subir audio:', error);
    return NextResponse.json(
      {
        error: 'Error al subir audio',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
