import { db } from '@/lib/firebase';
import { Timestamp, collection, doc, writeBatch } from 'firebase/firestore';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const organizationId = 'org_default'; // Ajusta según tu organización
    const userId = 'h7z2KgxBCVYtXf9PhaZpiKXNQwF3'; // Usuario de prueba

    const now = Timestamp.now();
    const nowDate = new Date();
    const events = [
      // Auditorías
      {
        title: 'Auditoría Interna ISO 9001',
        description:
          'Auditoría de seguimiento del sistema de gestión de calidad',
        type: 'audit',
        date: Timestamp.fromDate(
          new Date(nowDate.getFullYear(), nowDate.getMonth(), 15)
        ),
        status: 'scheduled',
        priority: 'high',
        sourceModule: 'audits',
        sourceRecordId: 'audit_001',
        sourceRecordNumber: 'AUD-2025-001',
        organizationId,
        responsibleUserId: userId,
        responsibleUserName: 'Roberto García',
        isSystemGenerated: true,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        title: 'Auditoría de Procesos',
        description: 'Revisión de procesos operativos',
        type: 'audit',
        date: Timestamp.fromDate(
          new Date(nowDate.getFullYear(), nowDate.getMonth(), 25)
        ),
        status: 'scheduled',
        priority: 'medium',
        sourceModule: 'audits',
        sourceRecordId: 'audit_002',
        sourceRecordNumber: 'AUD-2025-002',
        organizationId,
        responsibleUserId: userId,
        responsibleUserName: 'Roberto García',
        isSystemGenerated: true,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      // Vencimientos de documentos
      {
        title: 'Vencimiento: Manual de Calidad',
        description: 'Revisión anual del manual de calidad',
        type: 'document_expiry',
        date: Timestamp.fromDate(
          new Date(nowDate.getFullYear(), nowDate.getMonth(), 5)
        ),
        status: 'scheduled',
        priority: 'critical',
        sourceModule: 'documents',
        sourceRecordId: 'doc_001',
        sourceRecordNumber: 'DOC-MC-001',
        organizationId,
        responsibleUserId: userId,
        responsibleUserName: 'Roberto García',
        isSystemGenerated: true,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        title: 'Vencimiento: Procedimiento de Compras',
        description: 'Revisión semestral del procedimiento',
        type: 'document_expiry',
        date: Timestamp.fromDate(
          new Date(nowDate.getFullYear(), nowDate.getMonth(), 20)
        ),
        status: 'scheduled',
        priority: 'high',
        sourceModule: 'documents',
        sourceRecordId: 'doc_002',
        sourceRecordNumber: 'DOC-PC-002',
        organizationId,
        responsibleUserId: userId,
        responsibleUserName: 'Roberto García',
        isSystemGenerated: true,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      // Capacitaciones
      {
        title: 'Capacitación: ISO 9001:2015',
        description: 'Formación sobre requisitos de la norma ISO 9001',
        type: 'training',
        date: Timestamp.fromDate(
          new Date(nowDate.getFullYear(), nowDate.getMonth(), 10)
        ),
        status: 'scheduled',
        priority: 'medium',
        sourceModule: 'trainings',
        sourceRecordId: 'train_001',
        sourceRecordNumber: 'CAP-2025-001',
        organizationId,
        responsibleUserId: userId,
        responsibleUserName: 'Roberto García',
        isSystemGenerated: true,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      // Eventos generales
      {
        title: 'Reunión de Revisión por la Dirección',
        description: 'Revisión trimestral del sistema de gestión',
        type: 'general',
        date: Timestamp.fromDate(
          new Date(nowDate.getFullYear(), nowDate.getMonth(), 30)
        ),
        status: 'scheduled',
        priority: 'high',
        sourceModule: 'custom',
        organizationId,
        responsibleUserId: userId,
        responsibleUserName: 'Roberto García',
        isSystemGenerated: false,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      // Evento vencido para probar indicadores
      {
        title: 'Acción Correctiva Vencida',
        description: 'Implementación de mejora en proceso de producción',
        type: 'action_deadline',
        date: Timestamp.fromDate(
          new Date(
            nowDate.getFullYear(),
            nowDate.getMonth(),
            nowDate.getDate() - 5
          )
        ),
        status: 'scheduled',
        priority: 'critical',
        sourceModule: 'actions',
        sourceRecordId: 'action_001',
        sourceRecordNumber: 'AC-2025-001',
        organizationId,
        responsibleUserId: userId,
        responsibleUserName: 'Roberto García',
        isSystemGenerated: true,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      // Más eventos para el mes siguiente
      {
        title: 'Auditoría Externa',
        description: 'Auditoría de certificación ISO 9001',
        type: 'audit',
        date: Timestamp.fromDate(
          new Date(nowDate.getFullYear(), nowDate.getMonth() + 1, 8)
        ),
        status: 'scheduled',
        priority: 'critical',
        sourceModule: 'audits',
        sourceRecordId: 'audit_003',
        sourceRecordNumber: 'AUD-2025-003',
        organizationId,
        responsibleUserId: userId,
        responsibleUserName: 'Roberto García',
        isSystemGenerated: true,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    ];

    const batch = writeBatch(db);
    let count = 0;

    for (const event of events) {
      const docRef = doc(collection(db, 'calendar_events'));
      batch.set(docRef, event);
      count++;
    }

    await batch.commit();

    return NextResponse.json({
      success: true,
      message: `${count} eventos de prueba creados exitosamente`,
      count,
    });
  } catch (error) {
    console.error('Error seeding calendar events:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al crear eventos de prueba',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
