// Endpoint de API para obtener y eliminar un usuario (Auth + Firestore + Personnel)

import { getAdminAuth, getAdminFirestore } from '@/lib/firebase/admin';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
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

    const db = getAdminFirestore();
    const auth = getAdminAuth();

    console.log('[API /users/get] Fetching user:', userId);

    // 1. Fetch user document from Firestore
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      // If not in Firestore, try checking Auth just in case
      try {
        const userRecord = await auth.getUser(userId);
        // It exists in Auth but not in Firestore - return partial data
        return NextResponse.json({
          id: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
          photoURL: userRecord.photoURL,
          role: 'user', // Default or unknown
          permissions: [],
          status: 'active', // Auth exists, so active
          source: 'auth_only',
        });
      } catch {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
    }

    const userData = userDoc.data();

    // 2. (Optional) Fetch linked personnel data
    let personnelData = null;
    if (userData?.personnel_id) {
      const personnelDoc = await db
        .collection('personnel')
        .doc(userData.personnel_id)
        .get();
      if (personnelDoc.exists) {
        personnelData = personnelDoc.data();
      }
    }

    // 3. Return combined data
    return NextResponse.json({
      id: userDoc.id,
      ...userData,
      personnel: personnelData,
    });
  } catch (error) {
    console.error('[API /users/get] Error:', error);
    return NextResponse.json(
      {
        error: 'Error retrieving user',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

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
