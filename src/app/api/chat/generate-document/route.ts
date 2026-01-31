// API: /api/chat/generate-document
// Genera documentos ISO con ayuda de IA

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const { prompt, templateId, templateName } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    console.log('[API /chat/generate-document] Generating:', {
      templateId,
      templateName,
      promptLength: prompt.length,
    });

    // Intentar usar Groq para generación rápida
    try {
      const { GroqService } = await import('@/lib/groq/GroqService');

      const systemPrompt = `Eres un experto en Sistemas de Gestión de Calidad ISO 9001:2015.
Tu tarea es generar documentos profesionales para el SGC.
Responde SOLO con el contenido del documento, sin explicaciones adicionales.
Usa formato profesional y lenguaje formal en español.`;

      const response = await GroqService.enviarMensaje(
        prompt,
        [],
        systemPrompt
      );

      const latencyMs = Date.now() - startTime;
      console.log(
        '[API /chat/generate-document] Generated in',
        latencyMs,
        'ms'
      );

      return NextResponse.json({
        success: true,
        content: response.content || response,
        templateId,
        templateName,
        latencyMs,
        provider: 'groq',
      });
    } catch (groqError) {
      console.error('[API /chat/generate-document] Groq error:', groqError);

      // Fallback: intentar con Claude
      try {
        const { AIRouter } = await import('@/lib/ai/AIRouter');

        const response = await AIRouter.chat(
          prompt,
          [],
          `Eres un experto en ISO 9001. Genera el documento solicitado de manera profesional.`,
          'quality'
        );

        return NextResponse.json({
          success: true,
          content: response,
          templateId,
          templateName,
          latencyMs: Date.now() - startTime,
          provider: 'claude',
        });
      } catch (claudeError) {
        console.error(
          '[API /chat/generate-document] Claude error:',
          claudeError
        );
        throw claudeError;
      }
    }
  } catch (error) {
    console.error('[API /chat/generate-document] Error:', error);

    return NextResponse.json(
      {
        error: 'Error generating document',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
