/**
 * API Endpoint: POST /api/ai/assist
 * Genera asistencia IA para diferentes módulos del sistema
 *
 * ACTUALIZADO (Enero 2026):
 * - Usa Prompt Único del sistema
 * - URL relativa para evitar errores de conexión
 * - Mejor manejo de errores
 */

import {
  getImplementationContext,
  ImplementationContext,
} from '@/lib/ai/implementationContext';
import { buildSystemPrompt } from '@/lib/ai/systemPrompt';
import { NextRequest, NextResponse } from 'next/server';

interface AIAssistContext {
  modulo: string;
  tipo: string;
  campo?: string;
  datos?: Record<string, any>;
  organizationId?: string;
}

interface AIAssistRequest {
  context: AIAssistContext;
  action?: 'generate' | 'suggest' | 'analyze';
}

// Mapeo de tipo a tarea específica para el prompt
function getTaskSpecificPrompt(ctx: AIAssistContext): string {
  const tipo = ctx.tipo;
  const datos = ctx.datos || {};

  switch (tipo) {
    case 'procedimiento':
      return `
TAREA ESPECÍFICA: Generar contenido de procedimiento ISO 9001.
Módulo: "${ctx.modulo}"
${datos.nombre ? `Nombre del procedimiento: ${datos.nombre}` : ''}
${datos.objetivo ? `Objetivo: ${datos.objetivo}` : ''}

El procedimiento debe incluir:
1. Objetivo
2. Alcance
3. Responsabilidades
4. Descripción de actividades (paso a paso)
5. Registros asociados

Escribí en español, de forma clara y profesional.
`;

    case 'proceso':
      return `
TAREA ESPECÍFICA: Generar descripción de proceso ISO 9001.
Módulo: "${ctx.modulo}"
${datos.nombre ? `Nombre del proceso: ${datos.nombre}` : ''}
${datos.descripcion ? `Descripción: ${datos.descripcion}` : ''}

Incluí:
1. Objetivo del proceso
2. Entradas
3. Salidas
4. Actividades principales (lista numerada)
5. Indicadores sugeridos (KPIs)
6. Riesgos potenciales

Escribí en español, de forma estructurada.
`;

    case 'competencias':
      return `
TAREA ESPECÍFICA: Sugerir competencias para puesto.
Puesto: "${datos.puesto || datos.nombre || 'no especificado'}"
${datos.departamento ? `Departamento: ${datos.departamento}` : ''}

Generá una lista de:
1. Competencias técnicas (mínimo 3)
2. Competencias blandas (mínimo 3)
3. Formación requerida
4. Experiencia sugerida

Escribí en español, de forma concisa.
`;

    case 'causa_raiz':
      return `
TAREA ESPECÍFICA: Análisis de causa raíz.
Problema/hallazgo: "${datos.problema || datos.descripcion || datos.titulo || 'No especificado'}"
${datos.tipo ? `Tipo de acción: ${datos.tipo}` : ''}

Aplicá la técnica de los 5 Por Qués y proporcioná:
1. Análisis de causa raíz (5 por qués)
2. Causas principales identificadas
3. Acciones correctivas sugeridas
4. Acciones preventivas sugeridas

Escribí en español, de forma estructurada.
`;

    case 'checklist':
      return `
TAREA ESPECÍFICA: Generar checklist de auditoría.
Módulo: "${ctx.modulo}"
${datos.clausula ? `Cláusula ISO: ${datos.clausula}` : ''}

El checklist debe incluir:
1. Puntos a verificar (mínimo 10)
2. Evidencias esperadas
3. Criterio de cumplimiento

Formato: lista de verificación con [ ] para marcar.
Escribí en español.
`;

    default:
      return `
TAREA ESPECÍFICA: Generar contenido para "${ctx.tipo}" en módulo "${ctx.modulo}".
${datos.nombre ? `Nombre: ${datos.nombre}` : ''}
${datos.descripcion ? `Descripción: ${datos.descripcion}` : ''}

Escribí en español, de forma clara y profesional.
`;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: AIAssistRequest = await request.json();
    const { context, action = 'generate' } = body;

    // Validar request
    if (!context || !context.modulo || !context.tipo) {
      return NextResponse.json(
        { error: 'Contexto incompleto. Se requiere modulo y tipo.' },
        { status: 400 }
      );
    }

    // OBLIGATORIO: organizationId
    if (!context.organizationId) {
      return NextResponse.json(
        {
          error: 'Falta organizationId',
          message:
            'Se requiere identificar la organización para usar el asistente IA.',
          hint: 'Verificá que estés logueado correctamente.',
        },
        { status: 400 }
      );
    }

    // Obtener contexto de implementación
    let implementationContext: ImplementationContext | null = null;
    let systemPrompt = '';

    try {
      implementationContext = await getImplementationContext(
        context.organizationId
      );
      systemPrompt = buildSystemPrompt({
        context: implementationContext,
        taskType: 'general',
        additionalContext: getTaskSpecificPrompt(context),
      });
    } catch (ctxError) {
      console.warn('Error getting implementation context:', ctxError);
      // Usar prompt básico si falla el contexto
      const basicIdentity = `Sos Don Cándido IA, experto en ISO 9001:2015.
Tu objetivo es ayudar de forma práctica y clara.
Escribí en español latinoamericano.`;
      systemPrompt = basicIdentity + '\n\n' + getTaskSpecificPrompt(context);
    }

    // Llamar a la API de chat con timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos

    try {
      const chatResponse = await fetch(
        new URL('/api/chat', request.url).toString(),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [
              {
                role: 'user',
                content: systemPrompt,
              },
            ],
            stream: false,
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!chatResponse.ok) {
        const errorText = await chatResponse.text();
        console.error('Error en chat API:', errorText);
        return NextResponse.json(
          {
            error: 'El asistente no pudo procesar tu solicitud',
            message: 'Intentá de nuevo en unos segundos.',
            details:
              process.env.NODE_ENV === 'development' ? errorText : undefined,
          },
          { status: 503 }
        );
      }

      const data = await chatResponse.json();

      return NextResponse.json({
        success: true,
        content: data.content || data.message || data.text || '',
        context: {
          modulo: context.modulo,
          tipo: context.tipo,
          action,
        },
        implementationStage: implementationContext?.implementation_stage,
        isoStatus: implementationContext?.iso_status_summary,
      });
    } catch (fetchError: any) {
      clearTimeout(timeoutId);

      if (fetchError.name === 'AbortError') {
        return NextResponse.json(
          {
            error: 'Tiempo de espera agotado',
            message:
              'El asistente está tardando más de lo esperado. Intentá de nuevo.',
          },
          { status: 504 }
        );
      }
      throw fetchError;
    }
  } catch (error) {
    console.error('Error en /api/ai/assist:', error);
    return NextResponse.json(
      {
        error: 'Ocurrió un problema inesperado',
        message:
          'El equipo técnico fue notificado. Intentá de nuevo más tarde.',
        details:
          process.env.NODE_ENV === 'development'
            ? (error as Error).message
            : undefined,
      },
      { status: 500 }
    );
  }
}
