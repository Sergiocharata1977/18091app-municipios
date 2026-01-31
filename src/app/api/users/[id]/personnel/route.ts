import { db } from '@/lib/firebase';
import { getAdminAuth } from '@/lib/firebase/admin';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { NextRequest, NextResponse } from 'next/server';

// PUT /api/users/[id]/personnel - Vincular/desvincular personnel
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
    const body = await request.json();
    const { personnel_id } = body;

    // Validar que el usuario existe
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Si se proporciona personnel_id, validar que existe y no está asignado
    if (personnel_id) {
      const personnelRef = doc(db, 'personnel', personnel_id);
      const personnelDoc = await getDoc(personnelRef);

      if (!personnelDoc.exists()) {
        return NextResponse.json(
          { error: 'Personal no encontrado' },
          { status: 404 }
        );
      }

      // Verificar que el personnel no esté ya asignado a otro usuario
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('personnel_id', '==', personnel_id));
      const existingUsers = await getDocs(q);

      if (!existingUsers.empty && existingUsers.docs[0].id !== userId) {
        const existingUserData = existingUsers.docs[0].data();
        return NextResponse.json(
          {
            error: 'Este personal ya está vinculado a otro usuario',
            existingUser: existingUserData.email,
          },
          { status: 400 }
        );
      }
    }

    // Actualizar el usuario en Firestore
    await updateDoc(userRef, {
      personnel_id: personnel_id || null,
      updated_at: new Date(),
    });

    // Actualizar customClaims en Firebase Auth
    try {
      const auth = getAdminAuth();
      const user = await auth.getUser(userId);
      const currentClaims = user.customClaims || {};

      await auth.setCustomUserClaims(userId, {
        ...currentClaims,
        personnelId: personnel_id || null,
      });

      console.log(
        '[API /users/[id]/personnel] Updated customClaims for user:',
        userId
      );
    } catch (authError) {
      console.error(
        '[API /users/[id]/personnel] Error updating customClaims:',
        authError
      );
      // Continue even if customClaims update fails
    }

    return NextResponse.json({
      success: true,
      message: personnel_id
        ? 'Personal vinculado exitosamente'
        : 'Personal desvinculado exitosamente',
    });
  } catch (error) {
    console.error('Error updating user personnel:', error);
    return NextResponse.json(
      { error: 'Error al actualizar la vinculación' },
      { status: 500 }
    );
  }
}

// GET /api/users/[id]/personnel - Obtener personnel vinculado
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

    // Obtener usuario
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    const personnelId = userData?.personnel_id;

    if (!personnelId) {
      return NextResponse.json({ personnel: null });
    }

    // Obtener personnel vinculado
    const personnelRef = doc(db, 'personnel', personnelId);
    const personnelDoc = await getDoc(personnelRef);

    if (!personnelDoc.exists()) {
      return NextResponse.json({ personnel: null });
    }

    const personnelData = {
      id: personnelDoc.id,
      ...personnelDoc.data(),
    };

    return NextResponse.json({ personnel: personnelData });
  } catch (error) {
    console.error('Error fetching user personnel:', error);
    return NextResponse.json(
      { error: 'Error al obtener el personal vinculado' },
      { status: 500 }
    );
  }
}
