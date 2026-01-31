/**
 * API Route: Export MCP Executions to Excel/CSV
 * POST /api/mcp/excel/export
 *
 * Genera un archivo Excel/CSV con el historial de ejecuciones MCP
 */

import { exportExecutionsToExcel } from '@/services/excel';
import { getExecutionHistory } from '@/services/mcp';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { organization_id, user_id, filename, sheetName, limit, estado } =
      body;

    // Validación
    if (!organization_id || !user_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: organization_id, user_id',
        },
        { status: 400 }
      );
    }

    // Obtener ejecuciones
    const executions = await getExecutionHistory(organization_id, {
      limit: limit || 100,
      estado,
    });

    if (executions.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          message: 'No executions to export',
          rowsExported: 0,
        },
      });
    }

    // Generar Excel/CSV
    const result = await exportExecutionsToExcel(
      organization_id,
      user_id,
      executions,
      {
        filename: filename || `mcp_export_${Date.now()}.csv`,
        sheetName: sheetName || 'Ejecuciones MCP',
      }
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        filename: result.filename,
        base64: result.base64,
        mimeType: result.mimeType,
        size: result.size,
        rowsExported: executions.length,
        executionId: result.executionId,
      },
    });
  } catch (error) {
    console.error('[API] Excel Export Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
