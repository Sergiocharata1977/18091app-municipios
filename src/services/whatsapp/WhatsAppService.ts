/**
 * WhatsApp Service
 * Servicio principal para gestión de WhatsApp con Firestore
 */

import { getAdminFirestore } from '@/lib/firebase/admin';
import type {
  ConversationType,
  MessageStatus,
  SendMessageData,
  SendMessageResponse,
  TwilioWebhookPayload,
  WhatsAppConversation,
  WhatsAppMessage,
} from '@/types/whatsapp';
import { FieldValue } from 'firebase-admin/firestore';
import { extractPhoneNumber, sendWhatsAppMessage } from './TwilioClient';

// Obtener instancia de Firestore
const getDb = () => getAdminFirestore();

// ============================================================================
// COLECCIONES
// ============================================================================

const CONVERSATIONS_COLLECTION = 'whatsapp_conversations';
const MESSAGES_COLLECTION = 'whatsapp_messages';
const CONTACTS_COLLECTION = 'whatsapp_contacts';

// ============================================================================
// CONVERSACIONES
// ============================================================================

/**
 * Busca una conversación existente por teléfono y organización
 */
export async function findConversation(
  organizationId: string,
  phone: string
): Promise<WhatsAppConversation | null> {
  const cleanPhone = extractPhoneNumber(phone);

  const snapshot = await getDb()
    .collection(CONVERSATIONS_COLLECTION)
    .where('organization_id', '==', organizationId)
    .where('phone', '==', cleanPhone)
    .where('estado', '==', 'activa')
    .limit(1)
    .get();

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
  } as WhatsAppConversation;
}

/**
 * Crea una nueva conversación
 */
export async function createConversation(data: {
  organization_id: string;
  type: ConversationType;
  phone: string;
  contact_name: string;
  cliente_id?: string;
  cliente_nombre?: string;
  vendedor_id?: string;
  vendedor_nombre?: string;
  accion_id?: string;
  auditoria_id?: string;
}): Promise<WhatsAppConversation> {
  const cleanPhone = extractPhoneNumber(data.phone);
  const now = new Date();

  const conversationData = {
    organization_id: data.organization_id,
    type: data.type,
    phone: cleanPhone,
    contact_name: data.contact_name,
    participantes: data.vendedor_id ? [data.vendedor_id] : [],
    cliente_id: data.cliente_id || null,
    cliente_nombre: data.cliente_nombre || null,
    vendedor_id: data.vendedor_id || null,
    vendedor_nombre: data.vendedor_nombre || null,
    accion_id: data.accion_id || null,
    auditoria_id: data.auditoria_id || null,
    ultimo_mensaje: '',
    ultimo_mensaje_at: now,
    mensajes_no_leidos: 0,
    estado: 'activa',
    created_at: now,
    updated_at: now,
  };

  const docRef = await getDb()
    .collection(CONVERSATIONS_COLLECTION)
    .add(conversationData);

  return {
    id: docRef.id,
    ...conversationData,
  } as unknown as WhatsAppConversation;
}

/**
 * Obtiene las conversaciones de una organización
 */
export async function getConversations(
  organizationId: string,
  options?: {
    type?: ConversationType;
    clienteId?: string;
    limit?: number;
  }
): Promise<WhatsAppConversation[]> {
  let query = getDb()
    .collection(CONVERSATIONS_COLLECTION)
    .where('organization_id', '==', organizationId)
    .where('estado', '==', 'activa')
    .orderBy('ultimo_mensaje_at', 'desc');

  if (options?.type) {
    query = query.where('type', '==', options.type);
  }

  if (options?.clienteId) {
    query = query.where('cliente_id', '==', options.clienteId);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const snapshot = await query.get();

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as unknown[] as WhatsAppConversation[];
}

/**
 * Actualiza una conversación
 */
async function updateConversation(
  conversationId: string,
  data: Partial<WhatsAppConversation>
): Promise<void> {
  await getDb()
    .collection(CONVERSATIONS_COLLECTION)
    .doc(conversationId)
    .update({
      ...data,
      updated_at: new Date(),
    });
}

// ============================================================================
// MENSAJES
// ============================================================================

/**
 * Envía un mensaje de WhatsApp
 * Crea la conversación si no existe
 */
export async function sendMessage(
  data: SendMessageData
): Promise<SendMessageResponse> {
  try {
    // 1. Buscar o crear conversación
    let conversation = data.conversation_id
      ? await getConversationById(data.conversation_id)
      : await findConversation(data.organization_id, data.to);

    if (!conversation) {
      conversation = await createConversation({
        organization_id: data.organization_id,
        type: data.cliente_id ? 'CRM' : 'INTERNAL',
        phone: data.to,
        contact_name: data.cliente_nombre || 'Desconocido',
        cliente_id: data.cliente_id,
        cliente_nombre: data.cliente_nombre,
        vendedor_id: data.sender_user_id,
        vendedor_nombre: data.sender_name,
        accion_id: data.accion_id,
        auditoria_id: data.auditoria_id,
      });
    }

    // 2. Enviar mensaje vía Twilio
    const twilioResult = await sendWhatsAppMessage(
      data.to,
      data.body,
      data.media_url
    );

    if (!twilioResult.success) {
      return {
        success: false,
        error: twilioResult.error,
      };
    }

    // 3. Guardar mensaje en Firestore
    const messageData: Omit<WhatsAppMessage, 'id'> = {
      conversation_id: conversation.id,
      organization_id: data.organization_id,
      direction: 'OUTBOUND',
      from: process.env.TWILIO_WHATSAPP_NUMBER || '',
      to: extractPhoneNumber(data.to),
      type: data.type || 'text',
      body: data.body,
      media_url: data.media_url,
      template_name: data.template_name,
      template_variables: data.template_variables,
      sender_user_id: data.sender_user_id,
      sender_name: data.sender_name,
      status: 'sent',
      status_updated_at: new Date(),
      twilio_sid: twilioResult.messageSid,
      created_at: new Date(),
    };

    const messageRef = await getDb()
      .collection(MESSAGES_COLLECTION)
      .add(messageData);

    // 4. Actualizar la conversación
    await updateConversation(conversation.id, {
      ultimo_mensaje: data.body.substring(0, 100),
      ultimo_mensaje_at: new Date(),
    });

    // 5. Crear Acción CRM automática
    try {
      const db = getDb();
      const { Timestamp } = await import('firebase-admin/firestore');

      const nuevaAccion = {
        organization_id: data.organization_id,
        cliente_id: data.cliente_id || null,
        cliente_nombre: data.cliente_nombre || null,
        oportunidad_id: null, // Podríamos pasarlo si data lo tuviera
        tipo: 'whatsapp',
        canal: 'whatsapp',
        titulo: `WhatsApp Saliente: ${data.to}`,
        descripcion: data.body,
        resultado: 'enviado',
        fecha_programada: new Date().toISOString(),
        fecha_realizada: new Date().toISOString(),
        vendedor_id: data.sender_user_id,
        vendedor_nombre: data.sender_name,
        estado: 'completada',
        whatsapp_message_sid: twilioResult.messageSid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: data.sender_user_id,
      };

      await db
        .collection('organizations')
        .doc(data.organization_id)
        .collection('crm_acciones')
        .add(nuevaAccion);
    } catch (actionError) {
      console.error(
        '[WhatsAppService] Error creando acción CRM automática:',
        actionError
      );
      // No fallamos el envío si falla el registro de la acción, es un efecto secundario
    }

    return {
      success: true,
      message_id: messageRef.id,
      twilio_sid: twilioResult.messageSid,
      conversation_id: conversation.id,
    };
  } catch (error: any) {
    console.error('[WhatsAppService] Error enviando mensaje:', error);
    return {
      success: false,
      error: error.message || 'Error interno',
    };
  }
}

/**
 * Obtiene una conversación por ID
 */
async function getConversationById(
  conversationId: string
): Promise<WhatsAppConversation | null> {
  const doc = await getDb()
    .collection(CONVERSATIONS_COLLECTION)
    .doc(conversationId)
    .get();

  if (!doc.exists) {
    return null;
  }

  return {
    id: doc.id,
    ...doc.data(),
  } as WhatsAppConversation;
}

/**
 * Obtiene los mensajes de una conversación
 */
export async function getMessages(
  conversationId: string,
  options?: { limit?: number; beforeId?: string }
): Promise<WhatsAppMessage[]> {
  let query = getDb()
    .collection(MESSAGES_COLLECTION)
    .where('conversation_id', '==', conversationId)
    .orderBy('created_at', 'desc');

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const snapshot = await query.get();

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as unknown[] as WhatsAppMessage[];
}

// ============================================================================
// WEBHOOKS
// ============================================================================

/**
 * Procesa un mensaje entrante del webhook de Twilio
 */
export async function handleIncomingMessage(
  payload: TwilioWebhookPayload,
  organizationId: string
): Promise<void> {
  const fromPhone = extractPhoneNumber(payload.From);
  const toPhone = extractPhoneNumber(payload.To);

  // 1. Buscar conversación existente
  let conversation = await findConversation(organizationId, fromPhone);

  if (!conversation) {
    // Crear nueva conversación para mensaje entrante
    conversation = await createConversation({
      organization_id: organizationId,
      type: 'CRM',
      phone: fromPhone,
      contact_name: 'Nuevo contacto',
    });
  }

  // 2. Guardar mensaje entrante
  const messageData: Omit<WhatsAppMessage, 'id'> = {
    conversation_id: conversation.id,
    organization_id: organizationId,
    direction: 'INBOUND',
    from: fromPhone,
    to: toPhone,
    type: payload.NumMedia && parseInt(payload.NumMedia) > 0 ? 'media' : 'text',
    body: payload.Body || '',
    media_url: payload.MediaUrl0,
    media_type: payload.MediaContentType0,
    status: 'delivered',
    status_updated_at: new Date(),
    twilio_sid: payload.MessageSid,
    created_at: new Date(),
  };

  await getDb().collection(MESSAGES_COLLECTION).add(messageData);

  // 3. Actualizar conversación
  await getDb()
    .collection(CONVERSATIONS_COLLECTION)
    .doc(conversation.id)
    .update({
      ultimo_mensaje: (payload.Body || '').substring(0, 100),
      ultimo_mensaje_at: new Date(),
      mensajes_no_leidos: FieldValue.increment(1),
      updated_at: new Date(),
    });

  // 4. Crear Acción CRM automática (Inbound)
  try {
    const db = getDb();

    // Intentar buscar responsable (vendedor) de la conversación o cliente
    const vendedorId = conversation.vendedor_id || 'system';
    const vendedorNombre = conversation.vendedor_nombre || 'Sistema';

    const nuevaAccion = {
      organization_id: organizationId,
      cliente_id: conversation.cliente_id || null,
      cliente_nombre: conversation.cliente_nombre || null,
      oportunidad_id: null,
      tipo: 'whatsapp',
      canal: 'whatsapp',
      titulo: `WhatsApp Entrante: ${conversation.contact_name || fromPhone}`,
      descripcion: payload.Body || '[Mensaje Multimedia]',
      resultado: 'recibido',
      fecha_programada: new Date().toISOString(),
      fecha_realizada: new Date().toISOString(),
      vendedor_id: vendedorId,
      vendedor_nombre: vendedorNombre,
      estado: 'completada',
      whatsapp_message_sid: payload.MessageSid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'system_webhook',
    };

    await db
      .collection('organizations')
      .doc(organizationId)
      .collection('crm_acciones')
      .add(nuevaAccion);
  } catch (actionError) {
    console.error(
      '[WhatsAppService] Error creando acción CRM automática (Inbound):',
      actionError
    );
  }

  console.log(
    `[WhatsAppService] Mensaje entrante procesado: ${payload.MessageSid}`
  );
}

/**
 * Procesa actualización de estado de mensaje
 */
export async function handleStatusUpdate(
  messageSid: string,
  status: MessageStatus,
  errorCode?: string,
  errorMessage?: string
): Promise<void> {
  const snapshot = await getDb()
    .collection(MESSAGES_COLLECTION)
    .where('twilio_sid', '==', messageSid)
    .limit(1)
    .get();

  if (snapshot.empty) {
    console.warn(
      `[WhatsAppService] Mensaje no encontrado para status update: ${messageSid}`
    );
    return;
  }

  const doc = snapshot.docs[0];
  await doc.ref.update({
    status,
    status_updated_at: new Date(),
    error_code: errorCode || null,
    error_message: errorMessage || null,
  });

  console.log(
    `[WhatsAppService] Estado actualizado: ${messageSid} -> ${status}`
  );
}

// ============================================================================
// ALERTAS ISO 9001
// ============================================================================

/**
 * Envía alerta de acción correctiva vencida
 */
export async function sendAccionVencidaAlert(
  organizationId: string,
  accionId: string,
  responsablePhone: string,
  responsableNombre: string,
  accionTitulo: string
): Promise<SendMessageResponse> {
  const mensaje = `⚠️ *Alerta ISO 9001*\n\nLa acción correctiva "${accionTitulo}" está vencida.\n\nPor favor, actualice el estado o solicite prórroga.\n\n_Sistema de Gestión de Calidad_`;

  return sendMessage({
    organization_id: organizationId,
    to: responsablePhone,
    body: mensaje,
    sender_user_id: 'system',
    sender_name: 'Sistema ISO 9001',
    accion_id: accionId,
  });
}

/**
 * Envía recordatorio de auditoría próxima
 */
export async function sendAuditoriaProximaAlert(
  organizationId: string,
  auditoriaId: string,
  auditorPhone: string,
  auditorNombre: string,
  auditoriaTitulo: string,
  fechaProgramada: string
): Promise<SendMessageResponse> {
  const mensaje = `📋 *Recordatorio de Auditoría*\n\n"${auditoriaTitulo}"\n📅 Fecha: ${fechaProgramada}\n\nPrepare la documentación necesaria.\n\n_Sistema de Gestión de Calidad_`;

  return sendMessage({
    organization_id: organizationId,
    to: auditorPhone,
    body: mensaje,
    sender_user_id: 'system',
    sender_name: 'Sistema ISO 9001',
    auditoria_id: auditoriaId,
  });
}

// ============================================================================
// EXPORTS
// ============================================================================

export { extractPhoneNumber, formatWhatsAppNumber } from './TwilioClient';
