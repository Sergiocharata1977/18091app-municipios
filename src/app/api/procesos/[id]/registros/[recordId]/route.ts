import { NextRequest, NextResponse } from 'next/server';
import { ProcessRecordService } from '@/services/procesos/ProcessRecordService';
import { processRecordSchema } from '@/lib/validations/procesos';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; recordId: string }> }
) {
  try {
    const { recordId } = await params;
    const record = await ProcessRecordService.getById(recordId);

    if (!record) {
      return NextResponse.json(
        { error: 'Registro de proceso no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(record);
  } catch (error) {
    console.error('Error in registro GET:', error);
    return NextResponse.json(
      { error: 'Error al obtener registro de proceso' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; recordId: string }> }
) {
  try {
    const { recordId } = await params;
    const body = await request.json();
    const validatedData = processRecordSchema.parse(body);

    const record = await ProcessRecordService.update(recordId, validatedData);

    return NextResponse.json(record);
  } catch (error) {
    console.error('Error in registro PUT:', error);

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
      { error: 'Error al actualizar registro de proceso' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; recordId: string }> }
) {
  try {
    const { recordId } = await params;
    await ProcessRecordService.delete(recordId);

    return NextResponse.json({
      message: 'Registro de proceso eliminado exitosamente',
    });
  } catch (error) {
    console.error('Error in registro DELETE:', error);
    return NextResponse.json(
      { error: 'Error al eliminar registro de proceso' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; recordId: string }> }
) {
  try {
    const { recordId } = await params;
    const body = await request.json();

    if (body.action === 'move') {
      const { estado } = body;
      if (
        !estado ||
        !['pendiente', 'en-progreso', 'completado'].includes(estado)
      ) {
        return NextResponse.json({ error: 'Estado inválido' }, { status: 400 });
      }

      const record = await ProcessRecordService.moveToState(recordId, estado);
      return NextResponse.json(record);
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
  } catch (error) {
    console.error('Error in registro POST (move):', error);
    return NextResponse.json(
      { error: 'Error al mover registro de proceso' },
      { status: 500 }
    );
  }
}
