// Endpoint de API para eliminar un usuario (Auth + Firestore + Personnel)

import { getAdminAuth, getAdminFirestore } from '@/lib/firebase/admin';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const auth = getAdminAuth();
    const db = getAdminFirestore();

    console.log('[API /users/delete] Deleting user:', userId);

    // Get user data from Firestore to check if has personnel
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    const personnelId = userData?.personnel_id;

    // Delete from Firebase Auth
    try {
      await auth.deleteUser(userId);
      console.log('[API /users/delete] Deleted from Firebase Auth');
    } catch (authError) {
      console.error('[API /users/delete] Error deleting from Auth:', authError);
      // Continue even if Auth deletion fails (user might not exist)
    }

    // Delete from Firestore users collection
    await db.collection('users').doc(userId).delete();
    console.log('[API /users/delete] Deleted from Firestore users');

    // Delete personnel if exists and is linked
    if (personnelId) {
      try {
        await db.collection('personnel').doc(personnelId).delete();
        console.log(
          '[API /users/delete] Deleted linked personnel:',
          personnelId
        );
      } catch (personnelError) {
        console.error(
          '[API /users/delete] Error deleting personnel:',
          personnelError
        );
        // Continue even if personnel deletion fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Usuario eliminado exitosamente',
      deletedPersonnel: !!personnelId,
    });
  } catch (error) {
    console.error('[API /users/delete] Error:', error);

    return NextResponse.json(
      {
        error: 'Error al eliminar usuario',
        message: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
