/**
 * API Endpoint: GET /api/process-definitions/check-code
 * Verifica si un código de proceso ya existe en la organización
 *
 * Query params:
 * - code: string (código a verificar, ej: "CO", "DOC")
 * - orgId: string (ID de la organización)
 *
 * Response:
 * { available: boolean, existing?: { id, nombre, codigo } }
 */

import { getAdminFirestore } from '@/lib/firebase/admin';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const orgId = searchParams.get('orgId');

    if (!code) {
      return NextResponse.json(
        { error: 'Se requiere el parámetro "code"' },
        { status: 400 }
      );
    }

    // Normalizar código a mayúsculas
    const normalizedCode = code.toUpperCase().trim();

    // Validar formato (2-4 letras)
    if (!/^[A-Z]{2,4}$/.test(normalizedCode)) {
      return NextResponse.json(
        {
          available: false,
          error: 'El código debe tener entre 2 y 4 letras',
        },
        { status: 400 }
      );
    }

    // Obtener instancia de Firestore
    const db = getAdminFirestore();

    // Construir query base
    let queryRef = db
      .collection('process_definitions')
      .where('process_code', '==', normalizedCode)
      .where('vigente', '==', true);

    // Filtrar por organización si se proporciona
    if (orgId) {
      queryRef = queryRef.where('organization_id', '==', orgId);
    }

    const snapshot = await queryRef.limit(1).get();

    if (snapshot.empty) {
      return NextResponse.json({
        available: true,
        code: normalizedCode,
      });
    }

    // Código ya existe
    const existingDoc = snapshot.docs[0];
    const existingData = existingDoc.data();

    return NextResponse.json({
      available: false,
      code: normalizedCode,
      existing: {
        id: existingDoc.id,
        nombre: existingData.nombre,
        codigo:
          existingData.codigo ||
          `${existingData.category_id}-${existingData.process_code}`,
      },
    });
  } catch (error) {
    console.error('Error en /api/process-definitions/check-code:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
