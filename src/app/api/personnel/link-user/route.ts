// API endpoint for linking/unlinking users with personnel

import { getAdminAuth, getAdminFirestore } from '@/lib/firebase/admin';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, personnelId } = body;

    if (!userId || !personnelId) {
      return NextResponse.json(
        { error: 'userId y personnelId son requeridos' },
        { status: 400 }
      );
    }

    const auth = getAdminAuth();
    const db = getAdminFirestore();

    // Verify user exists
    try {
      await auth.getUser(userId);
    } catch {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Verify personnel exists
    const personnelDoc = await db
      .collection('personnel')
      .doc(personnelId)
      .get();
    if (!personnelDoc.exists) {
      return NextResponse.json(
        { error: 'Personal no encontrado' },
        { status: 404 }
      );
    }

    const personnelData = personnelDoc.data();

    // Check if personnel is already linked to another user
    if (personnelData?.user_id && personnelData.user_id !== userId) {
      return NextResponse.json(
        {
          error: 'Personal ya vinculado',
          message: `Este empleado ya está vinculado al usuario ${personnelData.user_id}. Primero desvincúlalo antes de asignarlo a otro usuario.`,
        },
        { status: 409 }
      );
    }

    // Check if user is already linked to another personnel
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();

    if (userData?.personnel_id && userData.personnel_id !== personnelId) {
      return NextResponse.json(
        {
          error: 'Usuario ya vinculado',
          message: `Este usuario ya está vinculado al personal ${userData.personnel_id}. Primero desvincúlalo antes de asignarlo a otro empleado.`,
        },
        { status: 409 }
      );
    }

    // Update personnel record
    await db
      .collection('personnel')
      .doc(personnelId)
      .update({
        user_id: userId,
        tiene_acceso_sistema: true,
        email: (await auth.getUser(userId)).email,
        updated_at: new Date(),
      });

    // Update user record in Firestore
    await db.collection('users').doc(userId).update({
      personnel_id: personnelId,
      updated_at: new Date(),
    });

    // Update custom claims
    const userRecord = await auth.getUser(userId);
    await auth.setCustomUserClaims(userId, {
      ...userRecord.customClaims,
      personnelId: personnelId,
    });

    console.log(
      `[API /personnel/link-user] Linked user ${userId} to personnel ${personnelId}`
    );

    return NextResponse.json({
      success: true,
      message: 'Usuario vinculado exitosamente con el empleado',
      data: {
        userId,
        personnelId,
      },
    });
  } catch (error) {
    console.error('[API /personnel/link-user] Error:', error);
    return NextResponse.json(
      {
        error: 'Error al vincular usuario',
        message: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, personnelId } = body;

    if (!userId && !personnelId) {
      return NextResponse.json(
        { error: 'Debes proporcionar userId o personnelId' },
        { status: 400 }
      );
    }

    const auth = getAdminAuth();
    const db = getAdminFirestore();

    let actualUserId = userId;
    let actualPersonnelId = personnelId;

    // If only userId provided, find personnel
    if (userId && !personnelId) {
      const userDoc = await db.collection('users').doc(userId).get();
      const userData = userDoc.data();
      actualPersonnelId = userData?.personnel_id;

      if (!actualPersonnelId) {
        return NextResponse.json(
          { error: 'Usuario no está vinculado a ningún personal' },
          { status: 404 }
        );
      }
    }

    // If only personnelId provided, find user
    if (personnelId && !userId) {
      const personnelDoc = await db
        .collection('personnel')
        .doc(personnelId)
        .get();
      const personnelData = personnelDoc.data();
      actualUserId = personnelData?.user_id;

      if (!actualUserId) {
        return NextResponse.json(
          { error: 'Personal no está vinculado a ningún usuario' },
          { status: 404 }
        );
      }
    }

    // Update personnel record
    await db.collection('personnel').doc(actualPersonnelId).update({
      user_id: null,
      tiene_acceso_sistema: false,
      updated_at: new Date(),
    });

    // Update user record in Firestore
    await db.collection('users').doc(actualUserId).update({
      personnel_id: null,
      updated_at: new Date(),
    });

    // Update custom claims
    const userRecord = await auth.getUser(actualUserId);
    const { personnelId: _personnelId, ...remainingClaims } =
      userRecord.customClaims || {};
    void _personnelId; // Intentionally unused - we just want to remove it from claims
    await auth.setCustomUserClaims(actualUserId, remainingClaims);

    console.log(
      `[API /personnel/link-user] Unlinked user ${actualUserId} from personnel ${actualPersonnelId}`
    );

    return NextResponse.json({
      success: true,
      message: 'Usuario desvinculado exitosamente del empleado',
      data: {
        userId: actualUserId,
        personnelId: actualPersonnelId,
      },
    });
  } catch (error) {
    console.error('[API /personnel/link-user] Error:', error);
    return NextResponse.json(
      {
        error: 'Error al desvincular usuario',
        message: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
