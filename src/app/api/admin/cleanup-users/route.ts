// src/app/api/admin/cleanup-users/route.ts
// Script para eliminar usuarios de prueba de Firebase Auth

import { getAdminAuth, getAdminFirestore } from '@/lib/firebase/admin';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/cleanup-users
 * Elimina todos los usuarios excepto los especificados en keepEmails
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keepEmails = [], dryRun = true } = body;

    if (!keepEmails || keepEmails.length === 0) {
      return NextResponse.json(
        { error: 'keepEmails es requerido - lista de emails a mantener' },
        { status: 400 }
      );
    }

    const auth = getAdminAuth();
    const db = getAdminFirestore();
    const results = {
      totalUsers: 0,
      usersDeleted: 0,
      usersKept: 0,
      firestoreDeleted: 0,
      errors: [] as string[],
      deleted: [] as string[],
      kept: [] as string[],
    };

    // Normalizar emails a minúsculas
    const keepEmailsLower = keepEmails.map((e: string) => e.toLowerCase());

    // 1. Obtener todos los usuarios de Firebase Auth
    const listUsersResult = await auth.listUsers(1000);
    results.totalUsers = listUsersResult.users.length;

    console.log(`Encontrados ${results.totalUsers} usuarios en Firebase Auth`);

    // 2. Procesar cada usuario
    for (const userRecord of listUsersResult.users) {
      const email = userRecord.email?.toLowerCase() || '';

      if (keepEmailsLower.includes(email)) {
        results.usersKept++;
        results.kept.push(email);
        continue;
      }

      // Usuario a eliminar
      results.deleted.push(email || userRecord.uid);

      if (!dryRun) {
        try {
          // Eliminar de Firebase Auth
          await auth.deleteUser(userRecord.uid);

          // Eliminar de Firestore si existe
          const userDoc = await db
            .collection('users')
            .doc(userRecord.uid)
            .get();
          if (userDoc.exists) {
            await db.collection('users').doc(userRecord.uid).delete();
            results.firestoreDeleted++;
          }

          results.usersDeleted++;
        } catch (error) {
          results.errors.push(`Error eliminando ${email}: ${error}`);
        }
      } else {
        results.usersDeleted++;
      }
    }

    return NextResponse.json({
      success: true,
      dryRun,
      message: dryRun
        ? `Simulación: Se eliminarían ${results.usersDeleted} usuarios, se mantendrían ${results.usersKept}`
        : `Completado: Se eliminaron ${results.usersDeleted} usuarios, se mantuvieron ${results.usersKept}`,
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
