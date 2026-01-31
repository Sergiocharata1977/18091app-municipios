import { NormPointVerificationSchema } from '@/lib/validations/audits';
import { AuditService } from '@/services/audits/AuditService';
import { NextRequest, NextResponse } from 'next/server';

// ============================================
// POST - Actualizar verificación de punto de norma
// ============================================

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = 'temp-user-id';
    const userName = 'Usuario Temporal';

    const body = await request.json();

    // Validar datos
    const validatedData = NormPointVerificationSchema.parse(body);

    // Asegurar que observations sea string | null (no undefined)
    const verificationData = {
      ...validatedData,
      observations: validatedData.observations ?? null,
    };

    await AuditService.updateNormPointVerification(
      params.id,
      validatedData.normPointCode,
      verificationData,
      userId,
      userName
    );

    return NextResponse.json({
      message: 'Verificación actualizada exitosamente',
    });
  } catch (error: unknown) {
    console.error('Error in POST /api/audits/[id]/verify-norm-point:', error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Error al actualizar la verificación' },
      { status: 500 }
    );
  }
}
