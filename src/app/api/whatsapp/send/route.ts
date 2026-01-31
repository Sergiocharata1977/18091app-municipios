/**
 * API para enviar mensajes de WhatsApp
 * POST /api/whatsapp/send
 */

import { sendMessage } from '@/services/whatsapp';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Schema de validación
const SendMessageSchema = z.object({
  organization_id: z.string().min(1, 'organization_id es requerido'),
  to: z.string().min(10, 'Número de teléfono inválido'),
  body: z.string().min(1, 'El mensaje no puede estar vacío'),
  conversation_id: z.string().optional(),
  media_url: z.string().url().optional(),
  template_name: z.string().optional(),
  template_variables: z.array(z.string()).optional(),

  // Remitente
  sender_user_id: z.string().min(1, 'sender_user_id es requerido'),
  sender_name: z.string().min(1, 'sender_name es requerido'),

  // Contexto opcional
  cliente_id: z.string().optional(),
  cliente_nombre: z.string().optional(),
  vendedor_id: z.string().optional(),
  accion_id: z.string().optional(),
  auditoria_id: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar datos
    const validationResult = SendMessageSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Datos inválidos',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Verificar configuración de Twilio
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      return NextResponse.json(
        {
          success: false,
          error: 'WhatsApp no está configurado. Contacte al administrador.',
        },
        { status: 503 }
      );
    }

    // Enviar mensaje
    const result = await sendMessage({
      organization_id: data.organization_id,
      conversation_id: data.conversation_id,
      to: data.to,
      body: data.body,
      media_url: data.media_url,
      template_name: data.template_name,
      template_variables: data.template_variables,
      sender_user_id: data.sender_user_id,
      sender_name: data.sender_name,
      cliente_id: data.cliente_id,
      cliente_nombre: data.cliente_nombre,
      vendedor_id: data.vendedor_id,
      accion_id: data.accion_id,
      auditoria_id: data.auditoria_id,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        message_id: result.message_id,
        conversation_id: result.conversation_id,
        twilio_sid: result.twilio_sid,
      },
    });
  } catch (error: any) {
    console.error('[API /whatsapp/send] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error interno del servidor',
      },
      { status: 500 }
    );
  }
}
