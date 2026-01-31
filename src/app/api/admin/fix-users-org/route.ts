// src/app/api/admin/fix-users-org/route.ts
// Script para asignar organization_id a usuarios y limpiar personnel

import { getAdminFirestore } from '@/lib/firebase/admin';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/fix-users-org
 * Asigna organization_id a usuarios y opcionalmente limpia personnel
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { organizationId, cleanPersonnel = false, dryRun = true } = body;

    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId es requerido' },
        { status: 400 }
      );
    }

    const db = getAdminFirestore();
    const results = {
      usersUpdated: 0,
      personnelDeleted: 0,
      errors: [] as string[],
      details: [] as any[],
    };

    // 1. Obtener todos los usuarios
    const usersSnapshot = await db.collection('users').get();

    console.log(`Encontrados ${usersSnapshot.size} usuarios`);

    // 2. Actualizar usuarios sin organization_id
    for (const doc of usersSnapshot.docs) {
      const data = doc.data();

      // Skip super_admin users
      if (data.rol === 'super_admin') {
        results.details.push({
          action: 'skip_user',
          id: doc.id,
          email: data.email,
          reason: 'super_admin',
        });
        continue;
      }

      if (!data.organization_id || data.organization_id !== organizationId) {
        results.details.push({
          action: 'update_user',
          id: doc.id,
          email: data.email,
          oldOrgId: data.organization_id || null,
          newOrgId: organizationId,
        });

        if (!dryRun) {
          await doc.ref.update({
            organization_id: organizationId,
          });
        }

        results.usersUpdated++;
      }
    }

    // 3. Limpiar personnel si se solicita
    if (cleanPersonnel) {
      const personnelSnapshot = await db.collection('personnel').get();

      for (const doc of personnelSnapshot.docs) {
        results.details.push({
          action: 'delete_personnel',
          id: doc.id,
          email: doc.data().email,
        });

        if (!dryRun) {
          await doc.ref.delete();
        }

        results.personnelDeleted++;
      }
    }

    return NextResponse.json({
      success: true,
      dryRun,
      message: dryRun
        ? `Simulación: ${results.usersUpdated} usuarios a actualizar, ${results.personnelDeleted} personnel a eliminar`
        : `Completado: ${results.usersUpdated} usuarios actualizados, ${results.personnelDeleted} personnel eliminados`,
      results,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      {
        error: 'Error en la operación',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
