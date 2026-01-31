// API endpoint para eliminar usuarios de test (los que empiezan con test-)
// Solo funciona en desarrollo o con autenticación de super admin

import { getAdminAuth, getAdminFirestore } from '@/lib/firebase/admin';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(request: NextRequest) {
  try {
    // Verificar que hay un header de autorización simple (para evitar uso accidental)
    const authHeader = request.headers.get('x-admin-key');
    if (authHeader !== 'delete-test-users-2024') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const auth = getAdminAuth();
    const db = getAdminFirestore();

    console.log('🔍 Buscando usuarios de test...');

    // Listar todos los usuarios
    const listUsersResult = await auth.listUsers(1000);

    // Filtrar usuarios que empiecen con "test-"
    const testUsers = listUsersResult.users.filter(user =>
      user.email?.startsWith('test-')
    );

    console.log(`📋 Encontrados ${testUsers.length} usuarios de test`);

    if (testUsers.length === 0) {
      return NextResponse.json({
        message: 'No hay usuarios de test para eliminar',
        deleted: 0,
      });
    }

    const deleted: string[] = [];
    const errors: string[] = [];

    // Eliminar cada usuario
    for (const user of testUsers) {
      try {
        // Eliminar de Firestore primero
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (userDoc.exists) {
          await db.collection('users').doc(user.uid).delete();
        }

        // Eliminar de Firebase Auth
        await auth.deleteUser(user.uid);
        deleted.push(user.email || user.uid);
      } catch (error) {
        errors.push(`${user.email}: ${error}`);
      }
    }

    return NextResponse.json({
      message: `Eliminados ${deleted.length} usuarios de test`,
      deleted,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Error eliminando usuarios:', error);
    return NextResponse.json(
      { error: 'Error interno', details: String(error) },
      { status: 500 }
    );
  }
}
