// ============================================
// SERVICIO DE CHAT - MANEJO DE SESIONES Y MENSAJES
// ============================================
// Usa Firebase Admin SDK para todas las operaciones
// Garantiza aislamiento multi-tenant por organization_id

import { getAdminFirestore } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import {
  ChatMessage,
  ChatSession,
  COLLECTIONS,
  CreateSessionInput,
  MAX_MESSAGES_PER_SESSION,
  UpdateSessionInput,
} from '../types';

export class ChatService {
  // ============================================
  // SESIONES
  // ============================================

  /**
   * Crear nueva sesión de chat
   * @param input Datos de la sesión
   * @returns Sesión creada
   */
  static async createSession(input: CreateSessionInput): Promise<ChatSession> {
    const db = getAdminFirestore();

    const sessionData = {
      organizationId: input.organizationId,
      userId: input.userId,
      personnelId: input.personnelId || null,
      title: 'Nueva conversación',
      type: input.type,
      module: input.module || null,
      status: 'active' as const,
      tags: [],
      messageCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastMessageAt: null, // Usar null en lugar de undefined para Firestore
    };

    const docRef = await db.collection(COLLECTIONS.SESSIONS).add(sessionData);

    console.log(
      '[ChatService] Session created:',
      docRef.id,
      'for org:',
      input.organizationId
    );

    return {
      id: docRef.id,
      ...sessionData,
      personnelId: sessionData.personnelId || undefined,
      module: sessionData.module || undefined,
      lastMessageAt: undefined,
    } as ChatSession;
  }

  /**
   * Obtener sesiones del usuario (filtradas por organización)
   * @param organizationId ID de la organización
   * @param userId ID del usuario
   * @param limit Límite de resultados
   * @returns Lista de sesiones
   */
  static async getSessions(
    organizationId: string,
    userId: string,
    limit = 20
  ): Promise<ChatSession[]> {
    const db = getAdminFirestore();

    // 🔐 SIEMPRE filtrar por organizationId primero
    const snapshot = await db
      .collection(COLLECTIONS.SESSIONS)
      .where('organizationId', '==', organizationId)
      .where('userId', '==', userId)
      .orderBy('updatedAt', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        lastMessageAt: data.lastMessageAt?.toDate() || null,
      } as ChatSession;
    });
  }

  /**
   * Obtener sesión por ID (con validación de organización)
   * @param sessionId ID de la sesión
   * @param organizationId ID de la organización (para validación)
   * @returns Sesión o null
   */
  static async getSession(
    sessionId: string,
    organizationId: string
  ): Promise<ChatSession | null> {
    const db = getAdminFirestore();

    const doc = await db.collection(COLLECTIONS.SESSIONS).doc(sessionId).get();

    if (!doc.exists) {
      return null;
    }

    const data = doc.data();
    if (!data) {
      return null;
    }

    // 🔐 Verificar que pertenece a la organización
    if (data.organizationId !== organizationId) {
      console.warn(
        '[ChatService] Access denied: session',
        sessionId,
        'belongs to different org'
      );
      throw new Error('Access denied: session belongs to another organization');
    }

    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      lastMessageAt: data.lastMessageAt?.toDate() || null,
    } as ChatSession;
  }

  /**
   * Actualizar sesión
   * @param sessionId ID de la sesión
   * @param organizationId ID de la organización (para validación)
   * @param updates Campos a actualizar
   */
  static async updateSession(
    sessionId: string,
    organizationId: string,
    updates: UpdateSessionInput
  ): Promise<void> {
    const db = getAdminFirestore();

    // Primero verificar acceso
    const session = await this.getSession(sessionId, organizationId);
    if (!session) {
      throw new Error('Session not found');
    }

    await db
      .collection(COLLECTIONS.SESSIONS)
      .doc(sessionId)
      .update({
        ...updates,
        updatedAt: new Date(),
      });

    console.log('[ChatService] Session updated:', sessionId);
  }

  /**
   * Eliminar sesión (soft delete - marca como completed)
   * @param sessionId ID de la sesión
   * @param organizationId ID de la organización (para validación)
   */
  static async deleteSession(
    sessionId: string,
    organizationId: string
  ): Promise<void> {
    await this.updateSession(sessionId, organizationId, {
      status: 'completed',
    });
    console.log('[ChatService] Session deleted (soft):', sessionId);
  }

  // ============================================
  // MENSAJES
  // ============================================

  /**
   * Agregar mensaje a la sesión
   * @param sessionId ID de la sesión
   * @param organizationId ID de la organización
   * @param role Rol del mensaje
   * @param content Contenido
   * @param inputType Tipo de input
   * @param metadata Metadatos opcionales
   * @returns Mensaje creado
   */
  static async addMessage(
    sessionId: string,
    organizationId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    inputType: 'text' | 'voice' = 'text',
    metadata?: ChatMessage['metadata']
  ): Promise<ChatMessage> {
    const db = getAdminFirestore();

    // Verificar acceso a la sesión primero
    const session = await this.getSession(sessionId, organizationId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Verificar límite de mensajes
    if (session.messageCount >= MAX_MESSAGES_PER_SESSION) {
      throw new Error('Maximum messages per session reached');
    }

    const messageData = {
      sessionId,
      organizationId, // 🔑 Denormalizado para queries
      role,
      content,
      inputType,
      metadata: metadata || null,
      createdAt: new Date(),
    };

    const docRef = await db.collection(COLLECTIONS.MESSAGES).add(messageData);

    // Actualizar contador en sesión
    await db
      .collection(COLLECTIONS.SESSIONS)
      .doc(sessionId)
      .update({
        messageCount: FieldValue.increment(1),
        updatedAt: new Date(),
        lastMessageAt: new Date(),
      });

    console.log(
      '[ChatService] Message added:',
      docRef.id,
      'to session:',
      sessionId
    );

    return {
      id: docRef.id,
      ...messageData,
    } as ChatMessage;
  }

  /**
   * Obtener mensajes de una sesión
   * @param sessionId ID de la sesión
   * @param organizationId ID de la organización (para validación)
   * @param limit Límite de resultados
   * @returns Lista de mensajes
   */
  static async getMessages(
    sessionId: string,
    organizationId: string,
    limit = 50
  ): Promise<ChatMessage[]> {
    const db = getAdminFirestore();

    // Verificar acceso a la sesión primero
    await this.getSession(sessionId, organizationId);

    const snapshot = await db
      .collection(COLLECTIONS.MESSAGES)
      .where('sessionId', '==', sessionId)
      .where('organizationId', '==', organizationId) // 🔐 Doble verificación
      .orderBy('createdAt', 'asc')
      .limit(limit)
      .get();

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
      } as ChatMessage;
    });
  }

  /**
   * Obtener últimos N mensajes para contexto de IA
   * @param sessionId ID de la sesión
   * @param organizationId ID de la organización
   * @param count Cantidad de mensajes
   * @returns Lista de mensajes recientes
   */
  static async getRecentMessages(
    sessionId: string,
    organizationId: string,
    count = 10
  ): Promise<ChatMessage[]> {
    const db = getAdminFirestore();

    const snapshot = await db
      .collection(COLLECTIONS.MESSAGES)
      .where('sessionId', '==', sessionId)
      .where('organizationId', '==', organizationId)
      .orderBy('createdAt', 'desc')
      .limit(count)
      .get();

    // Revertir orden para tener cronológico
    return snapshot.docs.reverse().map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
      } as ChatMessage;
    });
  }

  // ============================================
  // UTILIDADES
  // ============================================

  /**
   * Generar título automático para la sesión basado en primer mensaje
   * @param sessionId ID de la sesión
   * @param organizationId ID de la organización
   * @param firstMessage Primer mensaje del usuario
   */
  static async generateTitle(
    sessionId: string,
    organizationId: string,
    firstMessage: string
  ): Promise<void> {
    // Generar título simple: primeras palabras del mensaje
    const maxLength = 50;
    let title = firstMessage.trim();

    if (title.length > maxLength) {
      title = title.substring(0, maxLength).trim() + '...';
    }

    await this.updateSession(sessionId, organizationId, { title });
  }

  /**
   * Pausar sesiones inactivas (para job de mantenimiento)
   * @param organizationId ID de la organización (opcional, para todas si no se especifica)
   * @param inactiveThresholdMs Umbral de inactividad en ms
   */
  static async pauseInactiveSessions(
    organizationId?: string,
    inactiveThresholdMs = 24 * 60 * 60 * 1000 // 24 horas
  ): Promise<number> {
    const db = getAdminFirestore();

    const cutoffTime = new Date(Date.now() - inactiveThresholdMs);

    let query = db
      .collection(COLLECTIONS.SESSIONS)
      .where('status', '==', 'active')
      .where('updatedAt', '<', cutoffTime);

    if (organizationId) {
      query = query.where('organizationId', '==', organizationId);
    }

    const snapshot = await query.get();

    const updates = snapshot.docs.map(async doc => {
      await doc.ref.update({
        status: 'paused',
        updatedAt: new Date(),
      });
    });

    await Promise.all(updates);

    console.log('[ChatService] Paused', snapshot.size, 'inactive sessions');
    return snapshot.size;
  }
}
