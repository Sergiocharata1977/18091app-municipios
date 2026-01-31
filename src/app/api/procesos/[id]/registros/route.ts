import { NextRequest, NextResponse } from 'next/server';
import { ProcessRecordService } from '@/services/procesos/ProcessRecordService';
import {
  processRecordSchema,
  processRecordFiltersSchema,
} from '@/lib/validations/procesos';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: processId } = await params;
    const { searchParams } = new URL(request.url);

    // Parse filters
    const filters = processRecordFiltersSchema.parse({
      search: searchParams.get('search') || undefined,
      estado:
        (searchParams.get('estado') as
          | 'pendiente'
          | 'en-progreso'
          | 'completado') || undefined,
      prioridad:
        (searchParams.get('prioridad') as 'baja' | 'media' | 'alta') ||
        undefined,
    });

    const records = await ProcessRecordService.getFiltered(
      processId,
      filters.search,
      filters.estado,
      filters.prioridad
    );

    return NextResponse.json(records);
  } catch (error) {
    console.error('Error in registros GET:', error);
    return NextResponse.json(
      { error: 'Error al obtener registros de proceso' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: processId } = await params;
    const body = await request.json();

    // Add processId to the data
    const dataWithProcessId = { ...body, processId };
    const validatedData = processRecordSchema.parse(dataWithProcessId);

    const record = await ProcessRecordService.create(validatedData);

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error('Error in registros POST:', error);

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
      { error: 'Error al crear registro de proceso' },
      { status: 500 }
    );
  }
}
