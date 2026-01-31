import { EventService } from '@/services/events/EventService';
import { FindingService } from '@/services/findings/FindingService';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/findings/[id] - Obtener hallazgo por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const finding = await FindingService.getById(id);

    if (!finding) {
      return NextResponse.json(
        { error: 'Hallazgo no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ finding });
  } catch (error) {
    console.error('Error in GET /api/findings/[id]:', error);
    return NextResponse.json(
      { error: 'Error al obtener hallazgo' },
      { status: 500 }
    );
  }
}
// PUT /api/findings/[id] - Actualizar hallazgo
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Actualizar hallazgo
    const finding = await FindingService.update(id, body);

    // Sincronizar con evento del calendario (simplificado)
    try {
      const createdAtDate = finding.createdAt?.toDate
        ? finding.createdAt.toDate()
        : new Date();
      await EventService.syncFromSource({
        organization_id: (finding as any).organization_id || '',
        titulo: `🔎 Hallazgo: ${finding.registration?.name || 'Hallazgo'}`,
        descripcion: finding.registration?.description,
        tipo_evento: 'hallazgo',
        fecha_inicio: createdAtDate,
        responsable_id: finding.createdBy,
        responsable_nombre: finding.createdByName,
        estado: (finding.status === 'cerrado'
          ? 'completado'
          : finding.status === 'en_tratamiento'
            ? 'en_progreso'
            : 'programado') as any,
        prioridad: 'media',
        source_collection: 'findings',
        source_id: finding.id,
        created_by: finding.createdBy || 'system',
      });
    } catch (eventError) {
      console.error('Error syncing event for finding update:', eventError);
    }

    return NextResponse.json({ success: true, finding });
  } catch (error) {
    console.error('Error in PUT /api/findings/[id]:', error);
    return NextResponse.json(
      { error: 'Error al actualizar hallazgo' },
      { status: 500 }
    );
  }
}

// DELETE /api/findings/[id] - Eliminar hallazgo
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    await FindingService.delete(id, 'system', body.userName || 'Usuario');

    // Eliminar evento asociado del calendario
    try {
      await EventService.deleteBySource('findings', id);
    } catch (eventError) {
      console.error('Error deleting event for finding:', eventError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/findings/[id]:', error);
    return NextResponse.json(
      { error: 'Error al eliminar hallazgo' },
      { status: 500 }
    );
  }
}
