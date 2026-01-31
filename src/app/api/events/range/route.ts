import { adminDb } from '@/firebase/admin';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
/**
 * GET /api/events/range
 * Obtener eventos unificados por rango de fechas
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');
    const organizationId = searchParams.get('organizationId');

    if (!startDateStr || !endDateStr) {
      return NextResponse.json(
        { error: 'startDate y endDate son requeridos' },
        { status: 400 }
      );
    }

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json({ error: 'Fechas inválidas' }, { status: 400 });
    }

    console.log('[Events API] Fetching events...');
    console.log(
      '[Events API] Range:',
      startDate.toISOString(),
      '-',
      endDate.toISOString()
    );

    // Obtener TODOS los eventos de la colección (sin filtros por ahora)
    const snapshot = await adminDb.collection('events').get();

    console.log('[Events API] Total events in collection:', snapshot.size);

    // Mapear y filtrar por rango de fechas
    const events = snapshot.docs
      .map(doc => {
        const data = doc.data();

        // Convertir fecha_inicio
        let fechaInicio: Date;
        if (data.fecha_inicio?.toDate) {
          fechaInicio = data.fecha_inicio.toDate();
        } else if (data.fecha_inicio?._seconds) {
          fechaInicio = new Date(data.fecha_inicio._seconds * 1000);
        } else if (data.fecha_inicio instanceof Date) {
          fechaInicio = data.fecha_inicio;
        } else if (typeof data.fecha_inicio === 'string') {
          fechaInicio = new Date(data.fecha_inicio);
        } else {
          fechaInicio = new Date(0);
        }

        // Convertir fecha_fin
        let fechaFin: Date | undefined;
        if (data.fecha_fin) {
          if (data.fecha_fin?.toDate) {
            fechaFin = data.fecha_fin.toDate();
          } else if (data.fecha_fin?._seconds) {
            fechaFin = new Date(data.fecha_fin._seconds * 1000);
          } else if (data.fecha_fin instanceof Date) {
            fechaFin = data.fecha_fin;
          } else if (typeof data.fecha_fin === 'string') {
            fechaFin = new Date(data.fecha_fin);
          }
        }

        return {
          id: doc.id,
          organization_id: data.organization_id,
          titulo: data.titulo,
          descripcion: data.descripcion,
          tipo_evento: data.tipo_evento,
          fecha_inicio: fechaInicio.toISOString(),
          fecha_fin: fechaFin?.toISOString(),
          todo_el_dia: data.todo_el_dia || false,
          responsable_id: data.responsable_id,
          responsable_nombre: data.responsable_nombre,
          estado: data.estado,
          prioridad: data.prioridad,
          // Nueva arquitectura: referencia sin duplicar datos
          source_collection: data.source_collection,
          source_id: data.source_id,
          activo: data.activo,
          created_at: data.created_at?.toDate?.()?.toISOString() || null,
          updated_at: data.updated_at?.toDate?.()?.toISOString() || null,
          // Campos de compatibilidad con calendario actual
          date: fechaInicio.toISOString(),
          title: data.titulo,
          type: data.tipo_evento,
          isActive: data.activo,
          priority: data.prioridad,
          status: data.estado,
        };
      })
      .filter(event => {
        const eventDate = new Date(event.fecha_inicio);
        return eventDate >= startDate && eventDate <= endDate;
      })
      .sort((a, b) => {
        return (
          new Date(a.fecha_inicio).getTime() -
          new Date(b.fecha_inicio).getTime()
        );
      });

    console.log('[Events API] Events in range:', events.length);

    return NextResponse.json({
      events,
      count: events.length,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
  } catch (error: any) {
    console.error('[Events API] Error:', error);

    return NextResponse.json(
      {
        error: 'Error al obtener eventos',
        details: error?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
