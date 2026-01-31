// src/app/api/vendedor/acciones/route.ts
// API para sincronizar acciones desde la App Vendedor

import { adminDb } from '@/firebase/admin';
import type { AccionLocal } from '@/types/vendedor';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/vendedor/acciones
 * Crea una nueva acción sincronizada desde la app móvil
 */
export async function POST(request: NextRequest) {
  try {
    const accion: AccionLocal = await request.json();

    // Validar datos requeridos
    if (!accion.organizationId || !accion.vendedorId) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos (organizationId, vendedorId)' },
        { status: 400 }
      );
    }

    // Crear documento en Firestore (Colección CRM Acciones centralizada)
    const accionRef = adminDb
      .collection('organizations')
      .doc(accion.organizationId)
      .collection('crm_acciones')
      .doc(accion.id || adminDb.collection('_').doc().id);

    const accionData = {
      ...accion,
      // Mapear campos de App Vendedor a Modelo CRM
      origen: 'app_vendedor',
      syncedAt: new Date().toISOString(),
      createdAt: accion.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Asegurar que evidenciasIds sea array
      evidenciasIds: accion.evidenciasIds || [],
    };

    await accionRef.set(accionData);

    // Si hay cliente asociado, actualizar última interacción
    if (accion.clienteId) {
      const clienteRef = adminDb
        .collection('organizations')
        .doc(accion.organizationId)
        .collection('clientes')
        .doc(accion.clienteId);

      await clienteRef.update({
        ultimaInteraccion: accion.fechaRealizada || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      id: accionRef.id,
      message: 'Acción sincronizada exitosamente',
    });
  } catch (error) {
    console.error('Error al sincronizar acción:', error);
    return NextResponse.json(
      {
        error: 'Error al sincronizar acción',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/vendedor/acciones
 * Lista acciones recientes para el vendedor (Sync inicial)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    // Accept both camelCase and snake_case for compatibility
    const vendedorId =
      searchParams.get('vendedorId') || searchParams.get('vendedor_id');
    const organizationId =
      searchParams.get('organizationId') || searchParams.get('organization_id');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!vendedorId || !organizationId) {
      return NextResponse.json(
        {
          success: false,
          error: 'vendedorId y organizationId son requeridos',
          data: [],
        },
        { status: 400 }
      );
    }

    const accionesSnapshot = await adminDb
      .collection('organizations')
      .doc(organizationId)
      .collection('crm_acciones')
      .where('vendedorId', '==', vendedorId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    const acciones = accionesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      data: acciones,
      count: acciones.length,
    });
  } catch (error) {
    console.error('Error al listar acciones:', error);
    return NextResponse.json(
      {
        error: 'Error al listar acciones',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
