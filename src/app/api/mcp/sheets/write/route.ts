/**
 * API Route: Google Sheets Write
 * POST /api/mcp/sheets/write
 *
 * Escribe o agrega datos a una hoja de Google Sheets
 */

import { writeToSheet } from '@/services/google-sheets';
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
      values,
      append,
    } = body;

    // Validación
    if (!organization_id || !user_id || !spreadsheetId || !range || !values) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Missing required fields: organization_id, user_id, spreadsheetId, range, values',
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(values) || !values.every(row => Array.isArray(row))) {
      return NextResponse.json(
        { success: false, error: 'Invalid values format. Expected 2D array.' },
        { status: 400 }
      );
    }

    const result = await writeToSheet({
      organization_id,
      user_id,
      spreadsheetId,
      sheetName: sheetName || 'Sheet1',
      range,
      values,
      append: append === true,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        rowsWritten: result.rowsWritten,
        range: result.range,
        executionId: result.executionId,
      },
    });
  } catch (error) {
    console.error('[API] Sheets Write Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
