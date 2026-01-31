import { db } from '@/firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import { NextResponse } from 'next/server';

// Forzar ruta dinámica - no ejecutar durante build
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('🔍 Diagnóstico completo de Firebase...');

    // Verificar conexión a Firestore
    console.log('📡 Verificando conexión a Firestore...');

    // Intentar leer las colecciones
    const collections = ['departments', 'positions', 'personnel'];
    const results: any = {};

    for (const collectionName of collections) {
      try {
        console.log(`📁 Verificando colección: ${collectionName}`);
        const collectionRef = collection(db, collectionName);
        const snapshot = await getDocs(collectionRef);

        results[collectionName] = {
          exists: true,
          count: snapshot.size,
          docs: snapshot.docs.map(doc => ({
            id: doc.id,
            data: doc.data(),
          })),
        };

        console.log(`✅ ${collectionName}: ${snapshot.size} documentos`);
      } catch (error) {
        console.error(`❌ Error en colección ${collectionName}:`, error);
        results[collectionName] = {
          exists: false,
          error: error instanceof Error ? error.message : 'Error desconocido',
        };
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Diagnóstico completado',
      firebase: {
        projectId: 'app-4b05c',
        databaseType: 'Firestore',
        collections: results,
      },
      instructions: {
        firebaseConsole:
          'Ve a Firebase Console > Firestore Database (no Realtime Database)',
        createDatabase:
          'Si no tienes Firestore creado, haz clic en "Crear base de datos"',
        checkCollections:
          'Busca las colecciones: departments, positions, personnel',
      },
    });
  } catch (error) {
    console.error('❌ Error en diagnóstico:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error en diagnóstico',
        details: error instanceof Error ? error.message : 'Error desconocido',
        firebase: {
          projectId: 'app-4b05c',
          databaseType: 'Firestore',
          issue: 'Posible problema de conexión o configuración',
        },
      },
      { status: 500 }
    );
  }
}
