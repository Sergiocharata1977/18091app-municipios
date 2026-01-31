/**
 * API Route para inicializar el CRM
 * Crea estados Kanban y clientes de ejemplo
 */

import { ESTADOS_KANBAN_DEFAULT } from '@/data/crm/scoring-config';
import { db } from '@/firebase/config';
import { addDoc, collection, getDocs } from 'firebase/firestore';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // 1. Verificar si ya existen estados
    const estadosRef = collection(db, 'kanban_estados');
    const estadosSnapshot = await getDocs(estadosRef);

    let estados: any[] = [];

    if (estadosSnapshot.empty) {
      // Crear estados predeterminados
      const now = new Date().toISOString();

      for (const estadoDefault of ESTADOS_KANBAN_DEFAULT) {
        const estadoData = {
          ...estadoDefault,
          created_at: now,
          updated_at: now,
        };

        const docRef = await addDoc(estadosRef, estadoData);
        estados.push({ id: docRef.id, ...estadoData });
      }
    } else {
      estados = estadosSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    }

    // 2. Verificar si ya existen clientes
    const clientesRef = collection(db, 'clientes_crm');
    const clientesSnapshot = await getDocs(clientesRef);

    let clientesCreados = 0;

    if (clientesSnapshot.empty) {
      // Crear clientes de ejemplo
      const now = new Date().toISOString();
      const estadoProspecto = estados.find(e => e.nombre === 'Prospecto');
      const estadoContactado = estados.find(e => e.nombre === 'Contactado');
      const estadoEvaluacion = estados.find(e => e.nombre === 'En Evaluación');

      const clientesEjemplo = [
        {
          razon_social: 'Agropecuaria San Martín S.A.',
          nombre_comercial: 'San Martín Agro',
          cuit_cuil: '30-12345678-9',
          tipo_cliente: 'posible_cliente',
          estado_kanban_id: estadoProspecto?.id || estados[0].id,
          estado_kanban_nombre: estadoProspecto?.nombre || estados[0].nombre,
          historial_estados: [],
          email: 'contacto@sanmartin.com',
          telefono: '+54 9 11 1234-5678',
          direccion: 'Ruta 5 Km 120',
          localidad: 'San Martín',
          provincia: 'Buenos Aires',
          responsable_id: 'user-1',
          responsable_nombre: 'Juan Pérez',
          monto_estimado_compra: 500000,
          probabilidad_conversion: 60,
          total_compras_12m: 0,
          cantidad_compras_12m: 0,
          monto_total_compras_historico: 0,
          ultima_interaccion: now,
          notas: 'Interesado en semillas de soja',
          created_at: now,
          updated_at: now,
          created_by: 'system',
          isActive: true,
        },
        {
          razon_social: 'Estancia La Pampa',
          cuit_cuil: '20-98765432-1',
          tipo_cliente: 'posible_cliente',
          estado_kanban_id: estadoContactado?.id || estados[1].id,
          estado_kanban_nombre: estadoContactado?.nombre || estados[1].nombre,
          historial_estados: [],
          email: 'info@lapampa.com.ar',
          telefono: '+54 9 11 9876-5432',
          direccion: 'Camino Rural 234',
          localidad: 'General Pico',
          provincia: 'La Pampa',
          responsable_id: 'user-1',
          responsable_nombre: 'Juan Pérez',
          monto_estimado_compra: 750000,
          probabilidad_conversion: 40,
          total_compras_12m: 0,
          cantidad_compras_12m: 0,
          monto_total_compras_historico: 0,
          ultima_interaccion: now,
          notas: 'Primer contacto realizado, solicita cotización',
          created_at: now,
          updated_at: now,
          created_by: 'system',
          isActive: true,
        },
        {
          razon_social: 'Campos del Sur S.R.L.',
          nombre_comercial: 'Campos del Sur',
          cuit_cuil: '30-55555555-5',
          tipo_cliente: 'posible_cliente',
          estado_kanban_id: estadoEvaluacion?.id || estados[2].id,
          estado_kanban_nombre: estadoEvaluacion?.nombre || estados[2].nombre,
          historial_estados: [],
          email: 'ventas@camposdelsur.com',
          telefono: '+54 9 11 5555-5555',
          direccion: 'Av. Principal 456',
          localidad: 'Rosario',
          provincia: 'Santa Fe',
          responsable_id: 'user-2',
          responsable_nombre: 'María González',
          monto_estimado_compra: 1200000,
          probabilidad_conversion: 75,
          categoria_riesgo: 'B',
          limite_credito_actual: 1000000,
          total_compras_12m: 0,
          cantidad_compras_12m: 0,
          monto_total_compras_historico: 0,
          ultima_interaccion: now,
          notas: 'En proceso de evaluación crediticia',
          created_at: now,
          updated_at: now,
          created_by: 'system',
          isActive: true,
        },
      ];

      for (const cliente of clientesEjemplo) {
        await addDoc(clientesRef, cliente);
        clientesCreados++;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'CRM inicializado correctamente',
      data: {
        estados_creados: estadosSnapshot.empty ? estados.length : 0,
        clientes_creados: clientesCreados,
        total_estados: estados.length,
        total_clientes: clientesSnapshot.size + clientesCreados,
      },
    });
  } catch (error: any) {
    console.error('Error inicializando CRM:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to initialize CRM',
      },
      { status: 500 }
    );
  }
}
