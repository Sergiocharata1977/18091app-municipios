import { PositionService } from '@/services/rrhh/PositionService';
import { PositionFormData } from '@/types/rrhh';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/positions - Lista todos los puestos con conteo de personal
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organization_id');

    if (!organizationId) {
      return NextResponse.json(
        { error: 'organization_id es requerido' },
        { status: 400 }
      );
    }

    const positions =
      await PositionService.getAllWithPersonnelCount(organizationId);
    return NextResponse.json(positions);
  } catch (error) {
    console.error('Error getting positions:', error);
    return NextResponse.json(
      { error: 'Error al obtener puestos' },
      { status: 500 }
    );
  }
}

// POST /api/positions - Crear nuevo puesto
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar datos requeridos
    if (!body.nombre || body.nombre.trim() === '') {
      return NextResponse.json(
        { error: 'El nombre del puesto es requerido' },
        { status: 400 }
      );
    }

    if (!body.organization_id) {
      return NextResponse.json(
        { error: 'organization_id es requerido' },
        { status: 400 }
      );
    }

    const data: PositionFormData = {
      nombre: body.nombre,
      descripcion_responsabilidades: body.descripcion_responsabilidades,
      requisitos_experiencia: body.requisitos_experiencia,
      requisitos_formacion: body.requisitos_formacion,
      departamento_id: body.departamento_id,
      reporta_a_id: body.reporta_a_id,
      competenciasRequeridas: body.competenciasRequeridas || [],
      frecuenciaEvaluacion: body.frecuenciaEvaluacion || 12,
      nivel: body.nivel || 'operativo',
    };

    const id = await PositionService.create(data, body.organization_id);

    return NextResponse.json(
      { id, message: 'Puesto creado exitosamente' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating position:', error);
    const message =
      error instanceof Error ? error.message : 'Error al crear puesto';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
