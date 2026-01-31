import { NextRequest, NextResponse } from 'next/server';
import { ProcessService } from '@/services/procesos/ProcessService';
import { processDefinitionSchema } from '@/lib/validations/procesos';
import { ProcessDefinition } from '@/types/procesos';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const process = await ProcessService.getById(id);

    if (!process) {
      return NextResponse.json(
        { error: 'Definición de proceso no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(process);
  } catch (error) {
    console.error('Error in proceso GET:', error);
    return NextResponse.json(
      { error: 'Error al obtener definición de proceso' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = processDefinitionSchema.parse(body);

    // Transform array fields from objects to strings
    const transformedData: Partial<
      Omit<ProcessDefinition, 'id' | 'createdAt'>
    > = {
      ...validatedData,
      entradas: validatedData.entradas.map(e =>
        typeof e === 'string' ? e : e.value
      ),
      salidas: validatedData.salidas.map(s =>
        typeof s === 'string' ? s : s.value
      ),
      controles: validatedData.controles.map(c =>
        typeof c === 'string' ? c : c.value
      ),
      indicadores: validatedData.indicadores.map(i =>
        typeof i === 'string' ? i : i.value
      ),
      documentos: validatedData.documentos.map(d =>
        typeof d === 'string' ? d : d.value
      ),
    };

    const process = await ProcessService.update(id, transformedData);

    return NextResponse.json(process);
  } catch (error) {
    console.error('Error in proceso PUT:', error);

    if (
      error &&
      typeof error === 'object' &&
      'name' in error &&
      error.name === 'ZodError'
    ) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: (error as any).errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al actualizar definición de proceso' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await ProcessService.delete(id);

    return NextResponse.json({
      message: 'Definición de proceso eliminada exitosamente',
    });
  } catch (error) {
    console.error('Error in proceso DELETE:', error);
    return NextResponse.json(
      { error: 'Error al eliminar definición de proceso' },
      { status: 500 }
    );
  }
}

// PATCH for toggling estado
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (body.action === 'toggle_estado') {
      const process = await ProcessService.toggleEstado(id);
      return NextResponse.json(process);
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
  } catch (error) {
    console.error('Error in proceso PATCH:', error);
    return NextResponse.json(
      { error: 'Error al actualizar definición de proceso' },
      { status: 500 }
    );
  }
}
