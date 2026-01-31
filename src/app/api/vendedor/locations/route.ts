// src/app/api/vendedor/locations/route.ts
import { getAdminFirestore } from '@/lib/firebase/admin';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { organization_id, vendedor_id, lat, lng, accuracy, timestamp } =
      body;

    if (!organization_id || !vendedor_id || !lat || !lng) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    const { Timestamp } = await import('firebase-admin/firestore');
    const db = getAdminFirestore();

    // 1. Guardar en historial de ubicaciones
    await db
      .collection('organizations')
      .doc(organization_id)
      .collection('seller_locations')
      .doc(vendedor_id)
      .collection('history')
      .add({
        lat,
        lng,
        accuracy,
        timestamp: timestamp
          ? Timestamp.fromDate(new Date(timestamp))
          : Timestamp.now(),
        created_at: Timestamp.now(),
      });

    // 2. Actualizar última ubicación conocida (para acceso rápido)
    await db
      .collection('organizations')
      .doc(organization_id)
      .collection('seller_locations')
      .doc(vendedor_id)
      .set(
        {
          last_location: {
            lat,
            lng,
            accuracy,
            timestamp: timestamp
              ? Timestamp.fromDate(new Date(timestamp))
              : Timestamp.now(),
          },
          updated_at: Timestamp.now(),
        },
        { merge: true }
      );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[LocationAPI] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organization_id = searchParams.get('organization_id');
    const vendedor_id = searchParams.get('vendedor_id');
    const date = searchParams.get('date'); // YYYY-MM-DD

    if (!organization_id) {
      return NextResponse.json(
        { error: 'Falta organization_id' },
        { status: 400 }
      );
    }

    const db = getAdminFirestore();

    // Caso 1: Obtener últimas ubicaciones de todos los vendedores
    if (!vendedor_id) {
      const snapshot = await db
        .collection('organizations')
        .doc(organization_id)
        .collection('seller_locations')
        .get();

      const locations = snapshot.docs.map(doc => ({
        vendedor_id: doc.id,
        ...doc.data().last_location,
      }));

      return NextResponse.json({ locations });
    }

    // Caso 2: Obtener historial de un vendedor (para ruta)
    // Nota: Simplificado, idealmente filtrar por rango de fecha
    const snapshot = await db
      .collection('organizations')
      .doc(organization_id)
      .collection('seller_locations')
      .doc(vendedor_id)
      .collection('history')
      .orderBy('timestamp', 'desc')
      .limit(500) // Límite razonable para el mapa
      .get();

    const route = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        lat: data.lat,
        lng: data.lng,
        timestamp: data.timestamp.toDate().toISOString(),
      };
    });

    return NextResponse.json({ route });
  } catch (error: any) {
    console.error('[LocationAPI] GET Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
