/**
 * API Route: POST /api/billing/mobbex/webhook
 * Recibe notificaciones de pago de Mobbex
 */

import { db } from '@/firebase/config';
import { mobbexService } from '@/services/billing/MobbexService';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    console.log('[Mobbex Webhook] Received:', JSON.stringify(payload, null, 2));

    // Parsear el payload
    const result = mobbexService.parseWebhookPayload(payload);

    if (!result.userId) {
      console.error('[Mobbex Webhook] Could not extract userId from reference');
      return NextResponse.json({ received: true, warning: 'userId not found' });
    }

    // Actualizar usuario en Firestore
    const userRef = doc(db, 'users', result.userId);

    if (result.success) {
      // Pago exitoso - activar suscripción
      const nextBillingDate = new Date();
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

      await updateDoc(userRef, {
        planType: 'premium',
        status: 'active',
        activo: true,
        billing_status: 'active',
        mobbex_transaction_id: result.transactionId,
        next_billing_date: nextBillingDate,
        expirationDate: nextBillingDate,
        updated_at: serverTimestamp(),
      });

      console.log(`[Mobbex Webhook] User ${result.userId} upgraded to premium`);
    } else if (result.status === 'rejected') {
      // Pago rechazado
      await updateDoc(userRef, {
        billing_status: 'past_due',
        last_payment_error: result.transactionId,
        updated_at: serverTimestamp(),
      });

      console.log(
        `[Mobbex Webhook] Payment rejected for user ${result.userId}`
      );
    }

    return NextResponse.json({
      received: true,
      processed: true,
      userId: result.userId,
      status: result.status,
    });
  } catch (error) {
    console.error('[Mobbex Webhook] Error:', error);
    // Siempre retornar 200 para que Mobbex no reintente
    return NextResponse.json({
      received: true,
      error: error instanceof Error ? error.message : 'Processing error',
    });
  }
}

// GET para verificar que el endpoint está activo
export async function GET() {
  return NextResponse.json({
    service: 'mobbex-webhook',
    status: 'active',
    timestamp: new Date().toISOString(),
  });
}
