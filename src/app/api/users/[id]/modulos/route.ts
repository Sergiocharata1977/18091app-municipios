import { getAdminFirestore } from '@/lib/firebase/admin';
import { NextRequest, NextResponse } from 'next/server';

// PATCH: Actualizar módulos habilitados del usuario
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
    const body = await request.json();
    const { modulos_habilitados } = body;

    const db = getAdminFirestore();

    // Actualizar el documento del usuario
    await db.collection('users').doc(userId).update({
      modulos_habilitados: modulos_habilitados, // null = acceso completo, array = módulos específicos
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: 'Módulos actualizados correctamente',
    });
  } catch (error) {
    console.error('Error updating user modules:', error);
    return NextResponse.json(
      { error: 'Error al actualizar módulos' },
      { status: 500 }
    );
  }
}

// GET: Obtener módulos habilitados del usuario
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

    const db = getAdminFirestore();

    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();

    return NextResponse.json({
      success: true,
      modulos_habilitados: userData?.modulos_habilitados || null,
    });
  } catch (error) {
    console.error('Error getting user modules:', error);
    return NextResponse.json(
      { error: 'Error al obtener módulos' },
      { status: 500 }
    );
  }
}
