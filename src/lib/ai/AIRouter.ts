/**
 * Router de IA - Permite elegir entre diferentes proveedores de IA
 * según el caso de uso (velocidad vs calidad)
 */

import { ClaudeService } from '@/lib/claude/client';
import { GroqMessage, GroqService } from '@/lib/groq/GroqService';
import {
  IntentDetectionService,
  type DetectedIntent,
} from './IntentDetectionService';

export type AIProvider = 'groq' | 'claude';
export type AIMode = 'fast' | 'quality';

interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface AIAnalyticsEvent {
  timestamp: Date;
  provider: AIProvider;
  mode: AIMode;
  intent: string;
  responseTime: number;
  success: boolean;
  error?: string;
}

export class AIRouter {
  /**
   * Determinar qué proveedor usar según el modo
   */
  private static getProvider(mode: AIMode): AIProvider {
    // Por defecto, usar Groq para velocidad
    const defaultProvider =
      (process.env.DEFAULT_AI_PROVIDER as AIProvider) || 'groq';

    if (mode === 'fast') {
      return 'groq'; // Siempre Groq para respuestas rápidas
    }

    if (mode === 'quality') {
      return 'claude'; // Claude para análisis complejos
    }

    return defaultProvider;
  }

  /**
   * Enviar mensaje con streaming
   */
  static async chatStream(
    mensaje: string,
    historial: AIMessage[] = [],
    systemPrompt?: string,
    mode: AIMode = 'fast'
  ): Promise<ReadableStream> {
    const provider = this.getProvider(mode);

    console.log(`[AIRouter] Usando ${provider} en modo ${mode}`);

    if (provider === 'groq') {
      const groqHistorial: GroqMessage[] = historial.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      return GroqService.enviarMensajeStream(
        mensaje,
        groqHistorial,
        systemPrompt
      );
    } else {
      // Claude no tiene streaming nativo, convertir respuesta a stream
      let claudeHistorial = historial
        .filter(msg => msg.role !== 'system')
        .map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        }));

      // Claude requires at least one message
      if (claudeHistorial.length === 0) {
        claudeHistorial = [
          {
            role: 'user',
            content: mensaje,
          },
        ];
      }

      const response = await ClaudeService.enviarMensaje(
        systemPrompt || '',
        claudeHistorial,
        2000
      );

      // Convertir respuesta a stream
      const encoder = new TextEncoder();
      return new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(response.content));
          controller.close();
        },
      });
    }
  }

  /**
   * Enviar mensaje sin streaming (respuesta completa)
   */
  static async chat(
    mensaje: string,
    historial: AIMessage[] = [],
    systemPrompt?: string,
    mode: AIMode = 'fast'
  ): Promise<string> {
    const provider = this.getProvider(mode);

    console.log(`[AIRouter] Usando ${provider} en modo ${mode}`);

    if (provider === 'groq') {
      const groqHistorial: GroqMessage[] = historial.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await GroqService.enviarMensaje(
        mensaje,
        groqHistorial,
        systemPrompt
      );
      return response.content || '';
    } else {
      // Claude
      let claudeHistorial = historial
        .filter(msg => msg.role !== 'system')
        .map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        }));

      // Claude requires at least one message
      // If history is empty, add the current message
      if (claudeHistorial.length === 0) {
        claudeHistorial = [
          {
            role: 'user',
            content: mensaje,
          },
        ];
      }

      const response = await ClaudeService.enviarMensaje(
        systemPrompt || '',
        claudeHistorial,
        2000
      );

      return response.content;
    }
  }

  /**
   * Obtener información del proveedor actual
   */
  static getProviderInfo(mode: AIMode): {
    provider: AIProvider;
    latency: string;
    cost: string;
    quality: string;
  } {
    const provider = this.getProvider(mode);

    if (provider === 'groq') {
      return {
        provider: 'groq',
        latency: '2-3 segundos',
        cost: 'Muy bajo',
        quality: 'Alta',
      };
    } else {
      return {
        provider: 'claude',
        latency: '20-30 segundos',
        cost: 'Alto',
        quality: 'Muy alta',
      };
    }
  }

  /**
   * Verificar si un proveedor está disponible
   */
  static isProviderAvailable(provider: AIProvider): boolean {
    if (provider === 'groq') {
      return !!process.env.GROQ_API_KEY;
    } else if (provider === 'claude') {
      return !!process.env.ANTHROPIC_API_KEY;
    }
    return false;
  }

  /**
   * Obtener lista de proveedores disponibles
   */
  static getAvailableProviders(): AIProvider[] {
    const providers: AIProvider[] = [];

    if (this.isProviderAvailable('groq')) {
      providers.push('groq');
    }

    if (this.isProviderAvailable('claude')) {
      providers.push('claude');
    }

    return providers;
  }

  /**
   * Chat inteligente con detección de intención
   */
  static async smartChat(
    mensaje: string,
    historial: AIMessage[] = [],
    userContext?: any,
    mode: AIMode = 'fast'
  ): Promise<{ response: string; intent: DetectedIntent }> {
    const startTime = Date.now();

    try {
      // Detectar intención
      const intent = IntentDetectionService.detectIntent(mensaje, userContext);

      // Obtener prompt del sistema basado en intención
      const systemPrompt = IntentDetectionService.getSystemPromptForIntent(
        intent.type
      );

      // Enviar mensaje con prompt especializado
      const response = await this.chat(mensaje, historial, systemPrompt, mode);

      // Registrar evento de analytics
      this.logAnalyticsEvent({
        timestamp: new Date(),
        provider: this.getProvider(mode),
        mode,
        intent: intent.type,
        responseTime: Date.now() - startTime,
        success: true,
      });

      return { response, intent };
    } catch (error) {
      this.logAnalyticsEvent({
        timestamp: new Date(),
        provider: this.getProvider(mode),
        mode,
        intent: 'error',
        responseTime: Date.now() - startTime,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  }

  /**
   * Chat inteligente con streaming
   */
  static async smartChatStream(
    mensaje: string,
    historial: AIMessage[] = [],
    userContext?: any,
    mode: AIMode = 'fast'
  ): Promise<{ stream: ReadableStream; intent: DetectedIntent }> {
    // Detectar intención
    const intent = IntentDetectionService.detectIntent(mensaje, userContext);

    // Obtener prompt del sistema basado en intención
    const systemPrompt = IntentDetectionService.getSystemPromptForIntent(
      intent.type
    );

    // Obtener stream con prompt especializado
    const stream = await this.chatStream(
      mensaje,
      historial,
      systemPrompt,
      mode
    );

    return { stream, intent };
  }

  /**
   * Analizar contexto del usuario
   */
  static analyzeUserContext(userContext: any): {
    department?: string;
    role?: string;
    recentModules: string[];
    preferences: Record<string, any>;
  } {
    return {
      department: userContext?.department,
      role: userContext?.role,
      recentModules: userContext?.recentModules || [],
      preferences: userContext?.preferences || {},
    };
  }

  /**
   * Obtener recomendación de proveedor basada en contexto
   */
  static recommendProvider(
    messageLength: number,
    complexity: 'simple' | 'medium' | 'complex'
  ): AIProvider {
    // Para mensajes simples y cortos, usar Groq
    if (messageLength < 100 && complexity === 'simple') {
      return 'groq';
    }

    // Para análisis complejos, usar Claude
    if (complexity === 'complex') {
      return 'claude';
    }

    // Por defecto, usar Groq
    return 'groq';
  }

  /**
   * Registrar evento de analytics
   */
  private static logAnalyticsEvent(event: AIAnalyticsEvent): void {
    // Aquí se podría enviar a un servicio de analytics
    console.log('[AIRouter Analytics]', {
      timestamp: event.timestamp.toISOString(),
      provider: event.provider,
      mode: event.mode,
      intent: event.intent,
      responseTime: `${event.responseTime}ms`,
      success: event.success,
      error: event.error,
    });
  }

  /**
   * Obtener estadísticas de uso
   */
  static getUsageStats(): {
    totalRequests: number;
    successRate: number;
    averageResponseTime: number;
    providerDistribution: Record<AIProvider, number>;
  } {
    // Aquí se retornarían estadísticas reales desde una base de datos
    return {
      totalRequests: 0,
      successRate: 0,
      averageResponseTime: 0,
      providerDistribution: { groq: 0, claude: 0 },
    };
  }
}

export type { AIAnalyticsEvent, AIMessage };
