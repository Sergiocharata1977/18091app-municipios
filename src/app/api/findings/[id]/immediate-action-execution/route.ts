import { FindingImmediateActionExecutionSchema } from '@/lib/validations/findings';
import { FindingService } from '@/services/findings/FindingService';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/findings/[id]/immediate-action-execution
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Convertir fecha string a Date
    const formData = {
      ...body,
      executionDate: new Date(body.executionDate),
    };

    // Validar datos
    const validatedData = FindingImmediateActionExecutionSchema.parse(formData);

    // Actualizar ejecución
    await FindingService.updateImmediateActionExecution(
      id,
      validatedData,
      'system',
      body.userName || 'Usuario'
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(
      'Error in POST /api/findings/[id]/immediate-action-execution:',
      error
    );
    return NextResponse.json(
      { error: 'Error al actualizar ejecución' },
      { status: 500 }
    );
  }
}
