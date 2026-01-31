import { NormPointRelationService } from '@/services/normPoints/NormPointRelationService';
import { NormPointService } from '@/services/normPoints/NormPointService';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const priority = searchParams.get('priority');
    const normType = searchParams.get('normType');
    const mandatoryOnly = searchParams.get('mandatoryOnly') === 'true';

    // Obtener relaciones pendientes
    const pendingRelations =
      await NormPointRelationService.getByStatus('pendiente');
    const allNormPoints = await NormPointService.getAll();

    // Filtrar puntos de norma según criterios
    let filteredPoints = allNormPoints.filter(np =>
      pendingRelations.some(rel => rel.norm_point_id === np.id)
    );

    if (priority && priority !== 'all') {
      filteredPoints = filteredPoints.filter(np => np.priority === priority);
    }

    if (normType && normType !== 'all') {
      filteredPoints = filteredPoints.filter(np => np.tipo_norma === normType);
    }

    if (mandatoryOnly) {
      filteredPoints = filteredPoints.filter(np => np.is_mandatory);
    }

    // Ordenar por prioridad (obligatorios primero, luego por prioridad)
    const priorityOrder: Record<string, number> = {
      alta: 0,
      media: 1,
      baja: 2,
    };

    filteredPoints.sort((a, b) => {
      // Obligatorios primero
      if (a.is_mandatory && !b.is_mandatory) return -1;
      if (!a.is_mandatory && b.is_mandatory) return 1;

      // Luego por prioridad
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    return NextResponse.json(filteredPoints);
  } catch (error) {
    console.error('Error getting gaps:', error);
    return NextResponse.json(
      { error: 'Error al obtener gaps de cumplimiento' },
      { status: 500 }
    );
  }
}
