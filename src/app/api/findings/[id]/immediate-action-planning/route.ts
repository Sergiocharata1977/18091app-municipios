import { FindingImmediateActionPlanningSchema } from '@/lib/validations/findings';
import { FindingService } from '@/services/findings/FindingService';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/findings/[id]/immediate-action-planning
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
      plannedDate: new Date(body.plannedDate),
    };

    // Validar datos
    const validatedData = FindingImmediateActionPlanningSchema.parse(formData);

    // Actualizar planificación
    await FindingService.updateImmediateActionPlanning(
      id,
      validatedData,
      'system',
      body.userName || 'Usuario'
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(
      'Error in POST /api/findings/[id]/immediate-action-planning:',
      error
    );
    return NextResponse.json(
      { error: 'Error al actualizar planificación' },
      { status: 500 }
    );
  }
}
