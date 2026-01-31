// API endpoint to fix users without organization_id

import { getAdminFirestore } from '@/lib/firebase/admin';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const db = getAdminFirestore();

    console.log(
      '[API /users/fix-organization] Fetching users without organization_id...'
    );

    // Get all users
    const usersSnapshot = await db.collection('users').get();

    const usersToUpdate: string[] = [];
    const batch = db.batch();

    usersSnapshot.forEach(doc => {
      const data = doc.data();

      // Si no tiene organization_id y no es super_admin
      if (!data.organization_id && data.rol !== 'super_admin') {
        usersToUpdate.push(doc.id);
        batch.update(doc.ref, {
          organization_id: 'org_los_senores_del_agro',
          updated_at: new Date(),
        });
      }
    });

    if (usersToUpdate.length > 0) {
      await batch.commit();
      console.log(
        `[API /users/fix-organization] Updated ${usersToUpdate.length} users`
      );

      return NextResponse.json({
        success: true,
        message: `${usersToUpdate.length} usuarios actualizados con organization_id`,
        updatedUsers: usersToUpdate,
      });
    } else {
      console.log('[API /users/fix-organization] No users to update');

      return NextResponse.json({
        success: true,
        message: 'Todos los usuarios ya tienen organization_id asignado',
        updatedUsers: [],
      });
    }
  } catch (error) {
    console.error('[API /users/fix-organization] Error:', error);

    return NextResponse.json(
      {
        error: 'Error al actualizar usuarios',
        message: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
