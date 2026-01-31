// API: /api/chat/messages
// Envío y recepción de mensajes con IA

import { ChatService } from '@/features/chat/services/ChatService';
import { ContextService } from '@/features/chat/services/ContextService';
import { AIMode } from '@/features/chat/types';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { NextRequest, NextResponse } from 'next/server';

// Helper para obtener datos del usuario
async function getUserData(userId: string) {
  const db = getAdminFirestore();
  const userDoc = await db.collection('users').doc(userId).get();

  if (!userDoc.exists) {
    return null;
  }

  const data = userDoc.data();
  return {
    id: userDoc.id,
    organizationId: data?.organization_id,
    personnelId: data?.personnel_id,
  };
}

// Función para llamar a la IA
async function callAI(
  message: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }>,
  systemPrompt: string,
  mode: AIMode = 'fast'
): Promise<{
  response: string;
  tokens?: { input: number; output: number };
  provider: string;
}> {
  try {
    // Intentar usar AIRouter si existe
    const { AIRouter } = await import('@/lib/ai/AIRouter');
    const response = await AIRouter.chat(message, history, systemPrompt, mode);
    const providerInfo = AIRouter.getProviderInfo(mode);

    return {
      response,
      provider: providerInfo.provider,
    };
  } catch (error) {
    console.error('[API /chat/messages] Error calling AI:', error);

    // Fallback response
    return {
      response:
        'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta nuevamente.',
      provider: 'fallback',
    };
  }
}

// POST /api/chat/messages - Enviar mensaje y obtener respuesta
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const {
      userId,
      sessionId,
      content,
      inputType = 'text',
      mode = 'fast' as AIMode,
      module,
    } = body;

    // Validar parámetros
    if (!userId || !sessionId || !content) {
      return NextResponse.json(
        {
          error: 'Missing required parameters',
          details: {
            userId: !userId ? 'required' : 'ok',
            sessionId: !sessionId ? 'required' : 'ok',
            content: !content ? 'required' : 'ok',
          },
        },
        { status: 400 }
      );
    }

    // Obtener datos del usuario
    const user = await getUserData(userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.organizationId) {
      return NextResponse.json(
        { error: 'User has no organization assigned' },
        { status: 403 }
      );
    }

    console.log('[API /chat/messages] Processing message:', {
      userId,
      sessionId,
      contentLength: content.length,
      mode,
    });

    // Verificar que la sesión existe y pertenece al usuario/org
    const session = await ChatService.getSession(
      sessionId,
      user.organizationId
    );
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Guardar mensaje del usuario
    const userMessage = await ChatService.addMessage(
      sessionId,
      user.organizationId,
      'user',
      content,
      inputType
    );

    // Obtener historial reciente para contexto
    const recentMessages = await ChatService.getRecentMessages(
      sessionId,
      user.organizationId,
      10
    );

    // Preparar historial para IA (excluir el mensaje actual)
    const history = recentMessages
      .filter(m => m.id !== userMessage.id)
      .map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

    // Obtener contexto y generar prompt
    const context = await ContextService.getContext(
      user.organizationId,
      userId
    );
    const systemPrompt = ContextService.generateSystemPrompt(context, module);

    // Llamar a la IA
    // Si estamos en modo 'fast' (Groq), intentamos usar Tools
    let aiResponse;
    if (mode === 'fast') {
      const { GroqService } = await import('@/lib/groq/GroqService');
      const { TOOLS: REGISTRY_TOOLS, GROQ_TOOLS } = await import(
        '@/features/chat/tools/registry'
      );

      // Primera llamada a Groq
      // Convertir history a formato Groq
      const groqHistory: Array<{
        role: 'user' | 'assistant' | 'system' | 'tool';
        content: string | null;
        name?: string;
        tool_call_id?: string;
      }> = history.map(h => ({
        role: h.role as 'user' | 'assistant' | 'system',
        content: h.content,
      }));

      // Inyectar contexto de usuario para execution
      const toolContext = {
        organizationId: user.organizationId,
        userId: user.id,
        userName: user.id, // TODO: Get display name
      };

      let currentResponse = await GroqService.enviarMensaje(
        content,
        groqHistory,
        systemPrompt,
        GROQ_TOOLS // Pasamos la definición de tools
      );

      // Bucle de manejo de tools
      // Máximo 3 iteraciones para evitar bucles infinitos
      let iterations = 0;
      while (
        currentResponse.tool_calls &&
        currentResponse.tool_calls.length > 0 &&
        iterations < 3
      ) {
        iterations++;
        console.log(
          '[API /chat/messages] Tool calls detected:',
          currentResponse.tool_calls.length
        );

        // Agregar respuesta del asistente (con tool_calls) al historial
        groqHistory.push(currentResponse);

        // Ejecutar cada tool
        for (const toolCall of currentResponse.tool_calls) {
          const toolName = toolCall.function.name;
          const toolArgs = JSON.parse(toolCall.function.arguments);
          const toolDef = REGISTRY_TOOLS.find(t => t.name === toolName);

          let toolResult;
          if (toolDef) {
            try {
              console.log(`[API /chat/messages] Executing tool ${toolName}`);
              toolResult = await toolDef.execute(toolArgs, toolContext);
            } catch (err: any) {
              console.error(
                `[API /chat/messages] Tool execution error used ${toolName}:`,
                err
              );
              toolResult = { error: err.message };
            }
          } else {
            toolResult = { error: `Tool ${toolName} not found` };
          }

          // Agregar resultado al historial
          groqHistory.push({
            tool_call_id: toolCall.id,
            role: 'tool',
            name: toolName,
            content: JSON.stringify(toolResult),
          });
        }

        // Llamar de nuevo a Groq con los resultados
        currentResponse = await GroqService.enviarMensaje(
          '', // Mensaje vacío porque es continuación
          groqHistory,
          systemPrompt,
          GROQ_TOOLS
        );
      }

      // Respuesta final
      aiResponse = {
        response: currentResponse.content || 'Acción completada.',
        provider: 'groq',
      };
    } else {
      // Modo Claude (sin tools por ahora o usando AIRouter legacy)
      const aiResult = await callAI(content, history, systemPrompt, mode);
      aiResponse = aiResult;
    }

    // Guardar respuesta del asistente
    const assistantMessage = await ChatService.addMessage(
      sessionId,
      user.organizationId,
      'assistant',
      aiResponse.response,
      'text',
      {
        provider: aiResponse.provider,
        model: mode === 'fast' ? 'groq-llama3' : 'claude-3.5-sonnet',
        latencyMs: Date.now() - startTime,
      }
    );

    // Generar título si es el primer mensaje
    if (session.messageCount === 0 || session.title === 'Nueva conversación') {
      await ChatService.generateTitle(sessionId, user.organizationId, content);
    }

    const latencyMs = Date.now() - startTime;
    console.log('[API /chat/messages] Response sent in', latencyMs, 'ms');

    return NextResponse.json({
      success: true,
      userMessage,
      assistantMessage,
      provider: aiResponse.provider,
      mode,
      latencyMs,
    });
  } catch (error) {
    console.error('[API /chat/messages] Error:', error);

    // Check for access denied
    if (error instanceof Error && error.message.includes('Access denied')) {
      return NextResponse.json(
        { error: 'Access denied to this session' },
        { status: 403 }
      );
    }

    // Check for Firestore index error
    if (
      error instanceof Error &&
      error.message.includes('FAILED_PRECONDITION')
    ) {
      return NextResponse.json(
        {
          error: 'La base de datos requiere un índice.',
          indexUrl:
            error.message.match(/https:\/\/[^\s]+/)?.[0] ||
            'Check logs for URL',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: 'Error processing message',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET /api/chat/messages - Obtener mensajes de una sesión
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const sessionId = searchParams.get('sessionId');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!userId || !sessionId) {
      return NextResponse.json(
        { error: 'userId and sessionId are required' },
        { status: 400 }
      );
    }

    const user = await getUserData(userId);

    if (!user || !user.organizationId) {
      return NextResponse.json(
        { error: 'User not found or has no organization' },
        { status: 403 }
      );
    }

    const messages = await ChatService.getMessages(
      sessionId,
      user.organizationId,
      limit
    );

    return NextResponse.json({
      success: true,
      messages,
      total: messages.length,
    });
  } catch (error) {
    console.error('[API /chat/messages] Error:', error);
    return NextResponse.json(
      {
        error: 'Error fetching messages',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
