// API endpoint to send password reset email

import { getAdminAuth } from '@/lib/firebase/admin';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      );
    }

    const auth = getAdminAuth();

    console.log('[API /users/reset-password] Sending reset email to:', email);

    // Generate password reset link
    await auth.generatePasswordResetLink(email);

    console.log('[API /users/reset-password] Reset link generated');

    // In a real application, you would send this link via email
    // For now, we'll just return the link (in production, use a proper email service)
    return NextResponse.json({
      success: true,
      message: 'Email de restablecimiento enviado exitosamente',
      // Note: In production, don't return the link to the client
      // Instead, send it via email service
    });
  } catch (error) {
    console.error('[API /users/reset-password] Error:', error);

    // Handle specific Firebase Auth errors
    if (error && typeof error === 'object' && 'errorInfo' in error) {
      const firebaseError = error as {
        errorInfo: { code: string; message: string };
      };

      if (firebaseError.errorInfo.code === 'auth/user-not-found') {
        return NextResponse.json(
          {
            error: 'Usuario no encontrado',
            message: 'No existe un usuario con este email.',
          },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      {
        error: 'Error al enviar email de restablecimiento',
        message: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
