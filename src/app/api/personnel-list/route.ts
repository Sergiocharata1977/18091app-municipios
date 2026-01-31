// API route to get personnel list using Admin SDK
// This is used by other modules that need to select personnel

import { getAdminFirestore } from '@/lib/firebase/admin';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organization_id');

    if (!organizationId) {
      return NextResponse.json(
        { error: 'organization_id es requerido' },
        { status: 400 }
      );
    }

    const db = getAdminFirestore();
    const snapshot = await db.collection('personnel').get();

    // Map personnel data - fields are: nombres, apellidos, email, estado
    const personnel = snapshot.docs
      .map(doc => {
        const data = doc.data();

        // Build full name from nombres + apellidos
        const nombres = data.nombres || '';
        const apellidos = data.apellidos || '';
        const nombreCompleto = `${nombres} ${apellidos}`.trim();

        return {
          id: doc.id,
          nombre_completo: nombreCompleto || data.email || 'Sin nombre',
          puesto: data.tipo_personal || null,
          email: data.email,
          estado: data.estado,
        };
      })
      .filter(p => p.estado === 'Activo') // Only active personnel
      .filter(p => p.nombre_completo && p.nombre_completo !== 'Sin nombre')
      .sort((a, b) => a.nombre_completo.localeCompare(b.nombre_completo));

    console.log(
      `[personnel-list] Returning ${personnel.length} active personnel`
    );

    return NextResponse.json(personnel);
  } catch (error) {
    console.error('Error getting personnel for selector:', error);
    return NextResponse.json(
      { error: 'Error al obtener personal' },
      { status: 500 }
    );
  }
}
