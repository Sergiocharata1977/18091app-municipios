import { NextRequest, NextResponse } from 'next/server';
import {
  collection,
  getDocs,
  addDoc,
  writeBatch,
  doc,
} from 'firebase/firestore';
import { db } from '@/firebase/config';

// POST - Poblar colecciones con datos de prueba
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    if (action === 'clear') {
      // Limpiar todas las colecciones
      await clearCollections();
      return NextResponse.json({
        success: true,
        message: 'Colecciones limpiadas exitosamente',
        data: {
          cleared: true,
        },
      });
    }

    if (action === 'seed') {
      // Poblar con datos de prueba
      await seedCollections();
      return NextResponse.json({
        success: true,
        message: 'Datos de prueba creados exitosamente',
      });
    }

    if (action === 'fresh') {
      // Limpiar y poblar
      await clearCollections();
      await seedCollections();
      return NextResponse.json({
        success: true,
        message: 'Colecciones recreadas con datos de prueba',
      });
    }

    return NextResponse.json(
      { success: false, error: 'Acción no válida' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in seed process:', error);
    return NextResponse.json(
      { success: false, error: 'Error en el proceso de seeding' },
      { status: 500 }
    );
  }
}

// Función para limpiar colecciones
async function clearCollections() {
  try {
    // Limpiar definiciones de procesos
    const definitionsSnapshot = await getDocs(
      collection(db, 'processDefinitions')
    );
    const definitionsBatch = writeBatch(db);
    definitionsSnapshot.docs.forEach(docSnapshot => {
      definitionsBatch.delete(doc(db, 'processDefinitions', docSnapshot.id));
    });
    await definitionsBatch.commit();

    // Limpiar registros de procesos
    const recordsSnapshot = await getDocs(collection(db, 'processRecords'));
    const recordsBatch = writeBatch(db);
    recordsSnapshot.docs.forEach(docSnapshot => {
      recordsBatch.delete(doc(db, 'processRecords', docSnapshot.id));
    });
    await recordsBatch.commit();

    console.log('Colecciones limpiadas exitosamente');
  } catch (error) {
    console.error('Error clearing collections:', error);
    throw error;
  }
}

// Función para poblar con datos de prueba
async function seedCollections() {
  try {
    // Crear definiciones de procesos
    const definitionsData = [
      {
        name: 'Gestión de Calidad',
        description: 'Proceso para gestionar la calidad del sistema ISO 9001',
        category: 'calidad',
        responsible: 'admin@empresa.com',
        department: 'Calidad',
        version: '1.0',
        status: 'activo',
        createdBy: 'admin@empresa.com',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
      },
      {
        name: 'Auditorías Internas',
        description: 'Proceso para realizar auditorías internas del sistema',
        category: 'auditoria',
        responsible: 'auditor@empresa.com',
        department: 'Auditoría',
        version: '1.0',
        status: 'activo',
        createdBy: 'admin@empresa.com',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
      },
      {
        name: 'Mejora Continua',
        description: 'Proceso para implementar mejoras continuas',
        category: 'mejora',
        responsible: 'mejora@empresa.com',
        department: 'Mejora',
        version: '1.0',
        status: 'activo',
        createdBy: 'admin@empresa.com',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
      },
    ];

    const definitionsRefs = [];
    for (const definition of definitionsData) {
      const docRef = await addDoc(
        collection(db, 'processDefinitions'),
        definition
      );
      definitionsRefs.push({ id: docRef.id, ...definition });
    }

    // Crear registros de procesos
    const recordsData = [
      {
        name: 'Implementación ISO 9001 Q3',
        description:
          'Registro de proceso para implementación de ISO 9001 en el tercer trimestre',
        processDefinitionId: definitionsRefs[0].id,
        processDefinitionName: 'Gestión de Calidad',
        status: 'activo',
        createdBy: 'admin@empresa.com',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        kanbanStats: {
          totalCards: 12,
          pendingCards: 3,
          inProgressCards: 5,
          completedCards: 4,
        },
        isActive: true,
      },
      {
        name: 'Auditoría Interna 2024',
        description: 'Proceso de auditoría interna del sistema de gestión',
        processDefinitionId: definitionsRefs[1].id,
        processDefinitionName: 'Auditorías Internas',
        status: 'pausado',
        createdBy: 'auditor@empresa.com',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        kanbanStats: {
          totalCards: 8,
          pendingCards: 2,
          inProgressCards: 3,
          completedCards: 3,
        },
        isActive: true,
      },
      {
        name: 'Mejora Continua',
        description: 'Proceso de mejora continua del sistema',
        processDefinitionId: definitionsRefs[2].id,
        processDefinitionName: 'Mejora Continua',
        status: 'completado',
        createdBy: 'mejora@empresa.com',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        kanbanStats: {
          totalCards: 15,
          pendingCards: 0,
          inProgressCards: 0,
          completedCards: 15,
        },
        isActive: true,
      },
    ];

    const recordsRefs = [];
    for (const record of recordsData) {
      const docRef = await addDoc(collection(db, 'processRecords'), record);
      recordsRefs.push({ id: docRef.id, ...record });
    }

    // Crear listas Kanban para el primer registro
    if (recordsRefs.length > 0) {
      const firstRecordId = recordsRefs[0].id;

      const listsData = [
        {
          title: 'Pendiente',
          description: 'Tareas pendientes de realizar',
          color: 'bg-gray-100',
          position: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          title: 'En Progreso',
          description: 'Tareas en proceso de ejecución',
          color: 'bg-blue-100',
          position: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          title: 'Completado',
          description: 'Tareas completadas',
          color: 'bg-green-100',
          position: 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      for (const list of listsData) {
        await addDoc(
          collection(db, 'processRecords', firstRecordId, 'kanbanLists'),
          list
        );
      }
    }

    console.log('Datos de prueba creados exitosamente');
  } catch (error) {
    console.error('Error seeding collections:', error);
    throw error;
  }
}
