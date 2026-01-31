// src/app/api/vendedor/clientes/route.ts
// API para obtener clientes del CRM para la app vendedor

import { getAdminFirestore } from '@/lib/firebase/admin';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/vendedor/clientes?vendedorId=xxx&organizationId=xxx
 * Lista clientes del CRM para uso en la app vendedor
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const vendedorId = searchParams.get('vendedorId');
    const organizationId = searchParams.get('organizationId');

    if (!organizationId) {
      return NextResponse.json(
        { success: false, error: 'organizationId es requerido' },
        { status: 400 }
      );
    }

    const db = getAdminFirestore();

    // Obtener clientes del CRM (colección principal)
    const clientesSnapshot = await db
      .collection('crm_organizaciones')
      .where('organization_id', '==', organizationId)
      .where('isActive', '==', true)
      .get();

    // Mapear a formato compatible con ClienteLocal del vendedor
    const clientes = clientesSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        organizationId: data.organization_id,
        razonSocial: data.razon_social || data.nombre || 'Sin nombre',
        cuit: data.cuit || '',
        direccion: data.direccion || '',
        localidad: data.localidad || data.ciudad || '',
        provincia: data.provincia || '',
        ubicacion: data.ubicacion || undefined,
        telefono: data.telefono || '',
        email: data.email || '',
        vendedorId: data.responsable_id || vendedorId || '',
        estado: data.isActive ? 'activo' : 'inactivo',
        ultimaVisita: data.ultima_interaccion || undefined,
        notas: data.notas || '',
        lastSyncAt: new Date().toISOString(),
        version: 1,
      };
    });

    console.log(
      `[API Vendedor Clientes] Found ${clientes.length} clients for org ${organizationId}`
    );

    return NextResponse.json({
      success: true,
      clientes,
      count: clientes.length,
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API Vendedor Clientes] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al listar clientes',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
