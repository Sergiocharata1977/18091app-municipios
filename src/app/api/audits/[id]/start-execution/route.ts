import { AuditExecutionStartSchema } from '@/lib/validations/audits';
import { AuditService } from '@/services/audits/AuditService';
import { NextRequest, NextResponse } from 'next/server';

// ============================================
// POST - Iniciar ejecución de auditoría
// ============================================

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = 'temp-user-id';
    const userName = 'Usuario Temporal';

    const body = await request.json();

    // Convertir fecha
    if (body.executionDate) {
      body.executionDate = new Date(body.executionDate);
    }

    // Validar datos
    const validatedData = AuditExecutionStartSchema.parse(body);

    await AuditService.startExecution(
      params.id,
      validatedData,
      userId,
      userName
    );

    return NextResponse.json({
      message: 'Ejecución iniciada exitosamente',
    });
  } catch (error: unknown) {
    console.error('Error in POST /api/audits/[id]/start-execution:', error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Error al iniciar la ejecución' },
      { status: 500 }
    );
  }
}
