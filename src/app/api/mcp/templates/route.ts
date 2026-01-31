/**
 * API MCP - Listar Plantillas de Tareas
 * GET /api/mcp/templates
 */

import { getAllTemplates } from '@/services/mcp/templates';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const templates = getAllTemplates();

    return NextResponse.json({
      success: true,
      data: templates,
    });
  } catch (error: any) {
    console.error('[API /mcp/templates] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error interno del servidor',
      },
      { status: 500 }
    );
  }
}
