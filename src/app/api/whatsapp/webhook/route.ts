/**
 * Webhook de Twilio para recibir mensajes de WhatsApp
 * POST /api/whatsapp/webhook
 *
 * Este endpoint recibe:
 * 1. Mensajes entrantes de usuarios
 * 2. Actualizaciones de estado de mensajes enviados
 *
 * SECURITY:
 * - Validación de firma Twilio habilitada
 * - Logs sanitizados (sin PII)
 */

import { getAdminFirestore } from '@/lib/firebase/admin';
import { handleIncomingMessage, handleStatusUpdate } from '@/services/whatsapp';
import {
  emptyTwiMLResponse,
  validateWebhookSignature,
} from '@/services/whatsapp/TwilioClient';
import type { MessageStatus } from '@/types/whatsapp';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Sanitiza un número de teléfono para logs (oculta dígitos sensibles)
 * Ejemplo: +5491155551234 -> +549****1234
 */
function sanitizePhoneForLog(phone: string): string {
  if (!phone) return '[vacío]';
  const cleaned = phone.replace('whatsapp:', '');
  if (cleaned.length <= 8) return '****';
  return cleaned.substring(0, 4) + '****' + cleaned.slice(-4);
}

/**
 * Determina la organización basándose en el número de destino
 * Rechaza si no encuentra una organización configurada
 */
async function getOrganizationByPhone(phone: string): Promise<string | null> {
  const snapshot = await getAdminFirestore()
    .collection('organizations')
    .where('whatsapp_config.enabled', '==', true)
    .limit(1)
    .get();

  if (snapshot.empty) {
    // NO usar fallback - rechazar si no hay configuración válida
    console.warn(
      '[Webhook WhatsApp] No hay organizaciones con WhatsApp habilitado'
    );
    return null;
  }

  return snapshot.docs[0].id;
}

export async function POST(request: NextRequest) {
  try {
    // Obtener el contenido como FormData (Twilio envía application/x-www-form-urlencoded)
    const formData = await request.formData();

    // Validar firma de Twilio (seguridad)
    const signature = request.headers.get('x-twilio-signature') || '';
    const url = request.url;
    const params: Record<string, string> = {};
    formData.forEach((value, key) => {
      params[key] = value.toString();
    });

    // SECURITY: Validar firma de Twilio
    if (!validateWebhookSignature(signature, url, params)) {
      console.warn('[Webhook WhatsApp] Firma inválida rechazada');
      return new Response('Unauthorized', { status: 401 });
    }

    // Parsear el payload
    const payload = {
      MessageSid: formData.get('MessageSid') as string,
      AccountSid: formData.get('AccountSid') as string,
      From: formData.get('From') as string,
      To: formData.get('To') as string,
      Body: formData.get('Body') as string | undefined,
      NumMedia: formData.get('NumMedia') as string | undefined,
      MediaUrl0: formData.get('MediaUrl0') as string | undefined,
      MediaContentType0: formData.get('MediaContentType0') as
        | string
        | undefined,
      SmsStatus: formData.get('SmsStatus') as string | undefined,
      MessageStatus: formData.get('MessageStatus') as string | undefined,
      ErrorCode: formData.get('ErrorCode') as string | undefined,
      ErrorMessage: formData.get('ErrorMessage') as string | undefined,
    };

    // SECURITY: Logs sanitizados (sin PII)
    console.log('[Webhook WhatsApp] Payload recibido:', {
      MessageSid: payload.MessageSid?.substring(0, 8) + '...',
      From: sanitizePhoneForLog(payload.From),
      To: sanitizePhoneForLog(payload.To),
      Status: payload.SmsStatus || payload.MessageStatus,
      HasBody: !!payload.Body,
    });

    // Determinar si es un mensaje entrante o una actualización de estado
    const isStatusUpdate = payload.MessageStatus && !payload.Body;

    if (isStatusUpdate) {
      // Es una actualización de estado
      await handleStatusUpdate(
        payload.MessageSid,
        (payload.MessageStatus || payload.SmsStatus) as MessageStatus,
        payload.ErrorCode,
        payload.ErrorMessage
      );
    } else if (payload.Body || payload.NumMedia) {
      // Es un mensaje entrante
      const organizationId = await getOrganizationByPhone(payload.To);

      if (!organizationId) {
        console.error(
          '[Webhook WhatsApp] No se encontró organización para número:',
          sanitizePhoneForLog(payload.To)
        );
        // Responder OK para que Twilio no reintente, pero logear el error
        return new Response(emptyTwiMLResponse(), {
          headers: { 'Content-Type': 'text/xml' },
        });
      }

      await handleIncomingMessage(
        {
          MessageSid: payload.MessageSid,
          AccountSid: payload.AccountSid,
          From: payload.From,
          To: payload.To,
          Body: payload.Body,
          NumMedia: payload.NumMedia,
          MediaUrl0: payload.MediaUrl0,
          MediaContentType0: payload.MediaContentType0,
        },
        organizationId
      );
    }

    // Responder con TwiML vacío (Twilio lo requiere)
    return new Response(emptyTwiMLResponse(), {
      headers: { 'Content-Type': 'text/xml' },
    });
  } catch (error: any) {
    // SECURITY: No exponer detalles del error interno
    console.error('[Webhook WhatsApp] Error procesando webhook');

    // Aún así responder OK para no causar reintentos infinitos
    return new Response(emptyTwiMLResponse(), {
      headers: { 'Content-Type': 'text/xml' },
    });
  }
}

// Twilio también puede enviar GET para verificación inicial
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    message: 'WhatsApp webhook activo',
    timestamp: new Date().toISOString(),
  });
}
