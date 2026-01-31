/**
 * API Route: Export MCP Executions to Google Sheets
 * POST /api/mcp/sheets/export
 *
 * Exporta el historial de ejecuciones MCP a una hoja de Google Sheets
 */

import { exportExecutionsToSheet } from '@/services/google-sheets';
import { getExecutionHistory } from '@/services/mcp';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      organization_id,
      user_id,
      spreadsheetId,
      sheetName,
      range,
      includeHeaders,
      limit,
      estado,
    } = body;

    // Validación
    if (!organization_id || !user_id || !spreadsheetId) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Missing required fields: organization_id, user_id, spreadsheetId',
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
          rowsWritten: 0,
        },
      });
    }

    // Exportar a Sheets
    const result = await exportExecutionsToSheet(
      organization_id,
      user_id,
      {
        spreadsheetId,
        sheetName: sheetName || 'MCP Executions',
        range: range || 'A1',
        includeHeaders: includeHeaders !== false,
      },
      executions
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
        executionsExported: executions.length,
        rowsWritten: result.rowsWritten,
        range: result.range,
        executionId: result.executionId,
      },
    });
  } catch (error) {
    console.error('[API] Sheets Export Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
