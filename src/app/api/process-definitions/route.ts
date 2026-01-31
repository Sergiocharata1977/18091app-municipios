import { ProcessDefinitionServiceAdmin } from '@/services/processRecords/ProcessDefinitionServiceAdmin';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/process-definitions - Get all process definitions
export async function GET() {
  try {
    const definitions = await ProcessDefinitionServiceAdmin.getAllActive();
    return NextResponse.json(definitions);
  } catch (error) {
    console.error('Error getting process definitions:', error);
    return NextResponse.json(
      { error: 'Error al obtener definiciones de procesos' },
      { status: 500 }
    );
  }
}

// POST /api/process-definitions - Create or seed definitions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.action === 'create') {
      const {
        codigo,
        nombre,
        descripcion,
        objetivo,
        alcance,
        funciones_involucradas,
        categoria,
        documento_origen_id,
        puesto_responsable_id,
        jefe_proceso_id,
        jefe_proceso_nombre,
        etapas_default,
        activo,
        organization_id,
      } = body;

      // Solo nombre es requerido, todo lo demás es opcional
      if (!nombre) {
        return NextResponse.json(
          { error: 'El nombre es requerido' },
          { status: 400 }
        );
      }

      const id = await ProcessDefinitionServiceAdmin.create({
        codigo,
        nombre,
        descripcion,
        objetivo,
        alcance,
        funciones_involucradas,
        categoria,
        documento_origen_id,
        puesto_responsable_id,
        jefe_proceso_id,
        jefe_proceso_nombre,
        etapas_default,
        activo,
        organization_id,
      });

      return NextResponse.json(
        { id, message: 'Definición creada exitosamente' },
        { status: 201 }
      );
    }

    if (body.action === 'update') {
      const { id, ...updateData } = body;
      await ProcessDefinitionServiceAdmin.update(id, updateData);
      return NextResponse.json({
        message: 'Definición actualizada exitosamente',
      });
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
  } catch (error) {
    console.error('Error in POST:', error);
    return NextResponse.json(
      { error: 'Error al procesar solicitud' },
      { status: 500 }
    );
  }
}
