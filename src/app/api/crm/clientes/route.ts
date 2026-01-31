import { getAdminFirestore } from '@/lib/firebase/admin';
import { createClienteCRMSchema } from '@/lib/schemas/crm-schemas';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // MULTI-TENANT: Validar organization_id
    const organizationId = searchParams.get('organization_id');
    if (!organizationId) {
      return NextResponse.json(
        { success: false, error: 'organization_id es requerido' },
        { status: 400 }
      );
    }

    const db = getAdminFirestore();
    const clientesSnapshot = await db
      .collection('crm_organizaciones')
      .where('organization_id', '==', organizationId)
      .where('isActive', '==', true)
      .get();

    const clientes = clientesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      data: clientes,
    });
  } catch (error: any) {
    console.error('Error in GET /api/crm/clientes:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get clientes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // MULTI-TENANT: Validar organization_id
    if (!body.organization_id) {
      return NextResponse.json(
        { success: false, error: 'organization_id es requerido' },
        { status: 400 }
      );
    }

    // Validar datos
    const validatedData = createClienteCRMSchema.parse(body);

    const db = getAdminFirestore();

    // Obtener el primer estado Kanban o crear estados por defecto
    // Query sin orderBy para evitar índice compuesto
    const estadosSnapshot = await db
      .collection('crm_kanban_estados')
      .where('organization_id', '==', body.organization_id)
      .where('tipo', '==', 'crm')
      .get();

    let estadoKanbanId: string;

    if (estadosSnapshot.empty) {
      // Auto-crear estados Kanban por defecto para esta organización
      console.log(
        `[CRM] Creating default Kanban estados for org: ${body.organization_id}`
      );

      const defaultEstados = [
        { nombre: 'Prospecto', color: '#94a3b8', orden: 0 },
        { nombre: 'Contactado', color: '#60a5fa', orden: 1 },
        { nombre: 'Propuesta', color: '#fbbf24', orden: 2 },
        { nombre: 'Negociación', color: '#f97316', orden: 3 },
        { nombre: 'Cerrado', color: '#22c55e', orden: 4 },
      ];

      const batch = db.batch();
      const estadoRefs = [];

      for (const estado of defaultEstados) {
        const ref = db.collection('crm_kanban_estados').doc();
        batch.set(ref, {
          ...estado,
          organization_id: body.organization_id,
          tipo: 'crm',
          created_at: new Date().toISOString(),
        });
        estadoRefs.push(ref);
      }

      await batch.commit();
      estadoKanbanId = estadoRefs[0].id;

      console.log(
        `[CRM] Created ${defaultEstados.length} default Kanban estados`
      );
    } else {
      // Ordenar en memoria y tomar el primero
      const estados = estadosSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a: any, b: any) => a.orden - b.orden);
      estadoKanbanId = estados[0].id;
    }
    const now = new Date().toISOString();

    const clienteData = {
      ...validatedData,
      organization_id: body.organization_id,
      estado_kanban_id: estadoKanbanId,
      responsable_id: 'sistema',
      responsable_nombre: 'Sistema',
      isActive: true,
      fecha_registro: now,
      ultima_interaccion: now,
      created_at: now,
      updated_at: now,
    };

    const docRef = await db.collection('crm_organizaciones').add(clienteData);

    return NextResponse.json({
      success: true,
      data: { id: docRef.id, ...clienteData },
    });
  } catch (error: any) {
    console.error('Error in POST /api/crm/clientes:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Error de validación', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create cliente' },
      { status: 500 }
    );
  }
}
