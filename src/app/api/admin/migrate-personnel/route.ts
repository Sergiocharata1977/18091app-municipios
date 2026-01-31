// src/app/api/admin/migrate-personnel/route.ts
// Script de migración para agregar organization_id a documentos de personnel existentes
// También crea personnel desde usuarios que no tienen registro

import { getAdminFirestore } from '@/lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/migrate-personnel
 * Migra documentos de personnel agregando organization_id
 * Crea personnel desde usuarios que no tienen registro
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { organizationId, dryRun = true } = body;

    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId es requerido' },
        { status: 400 }
      );
    }

    const db = getAdminFirestore();
    const results = {
      totalUsers: 0,
      totalPersonnel: 0,
      personnelMigrated: 0,
      personnelCreatedFromUsers: 0,
      alreadyHasOrgId: 0,
      errors: [] as string[],
      details: [] as any[],
    };

    // 1. Obtener usuarios de la organización
    const usersSnapshot = await db
      .collection('users')
      .where('organization_id', '==', organizationId)
      .get();

    results.totalUsers = usersSnapshot.size;

    // Crear mapa de usuarios por email
    const usersByEmail: Record<string, any> = {};
    usersSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.email) {
        usersByEmail[data.email.toLowerCase()] = {
          id: doc.id,
          ...data,
        };
      }
    });

    // 2. Obtener todo el personnel existente
    const personnelSnapshot = await db.collection('personnel').get();
    results.totalPersonnel = personnelSnapshot.size;

    // Crear mapa de personnel por email
    const personnelByEmail: Record<string, any> = {};
    personnelSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.email) {
        personnelByEmail[data.email.toLowerCase()] = {
          id: doc.id,
          ref: doc.ref,
          ...data,
        };
      }
    });

    console.log(
      `Encontrados ${results.totalUsers} usuarios y ${results.totalPersonnel} personnel`
    );

    const batch = db.batch();
    let batchCount = 0;

    // 3. Procesar personnel existente - agregar organization_id si falta
    for (const doc of personnelSnapshot.docs) {
      const data = doc.data();

      if (!data.organization_id) {
        results.details.push({
          action: 'update_personnel',
          id: doc.id,
          email: data.email,
          status: 'migrated',
        });

        if (!dryRun) {
          batch.update(doc.ref, {
            organization_id: organizationId,
            updated_at: Timestamp.now(),
          });
          batchCount++;
        }

        results.personnelMigrated++;
      } else {
        results.alreadyHasOrgId++;
      }
    }

    // 4. Crear personnel para usuarios que no tienen registro
    for (const email of Object.keys(usersByEmail)) {
      const user = usersByEmail[email];
      const existingPersonnel = personnelByEmail[email];

      if (!existingPersonnel) {
        // Crear nuevo personnel desde el usuario
        const newPersonnelData = {
          organization_id: organizationId,
          email: user.email,
          nombres:
            user.displayName?.split(' ')[0] || user.email.split('@')[0] || '',
          apellidos: user.displayName?.split(' ').slice(1).join(' ') || '',
          estado: 'Activo',
          tipo_personal: user.role === 'admin' ? 'Administrativo' : 'Operativo',
          user_id: user.id,
          tiene_acceso_sistema: true,
          fecha_ingreso: user.createdAt || Timestamp.now(),
          created_at: Timestamp.now(),
          updated_at: Timestamp.now(),
        };

        results.details.push({
          action: 'create_personnel',
          email: user.email,
          userId: user.id,
          status: 'created',
          data: newPersonnelData,
        });

        if (!dryRun) {
          const newDocRef = db.collection('personnel').doc();
          batch.set(newDocRef, newPersonnelData);
          batchCount++;
        }

        results.personnelCreatedFromUsers++;
      }

      // Commit cada 400 operaciones
      if (!dryRun && batchCount >= 400) {
        await batch.commit();
        batchCount = 0;
      }
    }

    // Commit final
    if (!dryRun && batchCount > 0) {
      await batch.commit();
    }

    return NextResponse.json({
      success: true,
      dryRun,
      message: dryRun
        ? `Simulación completada. Se migrarían ${results.personnelMigrated} y se crearían ${results.personnelCreatedFromUsers} personnel.`
        : `Migración completada. Se migraron ${results.personnelMigrated} y se crearon ${results.personnelCreatedFromUsers} personnel.`,
      results,
    });
  } catch (error) {
    console.error('Error en migración de personnel:', error);
    return NextResponse.json(
      {
        error: 'Error en migración',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/migrate-personnel?organizationId=xxx
 * Obtiene estado actual de los documentos de personnel
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');

    const db = getAdminFirestore();

    // Obtener todos los personnel
    const personnelSnapshot = await db.collection('personnel').get();

    const stats = {
      total: personnelSnapshot.size,
      withOrgId: 0,
      withoutOrgId: 0,
      byOrganization: {} as Record<string, number>,
      personnel: [] as any[],
    };

    personnelSnapshot.docs.forEach(doc => {
      const data = doc.data();

      if (data.organization_id) {
        stats.withOrgId++;
        stats.byOrganization[data.organization_id] =
          (stats.byOrganization[data.organization_id] || 0) + 1;
      } else {
        stats.withoutOrgId++;
      }

      stats.personnel.push({
        id: doc.id,
        email: data.email,
        nombres: data.nombres,
        apellidos: data.apellidos,
        organization_id: data.organization_id || null,
        user_id: data.user_id || null,
        tiene_acceso_sistema: data.tiene_acceso_sistema || false,
      });
    });

    return NextResponse.json({
      success: true,
      stats,
      targetOrganization: organizationId,
    });
  } catch (error) {
    console.error('Error obteniendo estado de personnel:', error);
    return NextResponse.json(
      {
        error: 'Error al obtener estado',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
