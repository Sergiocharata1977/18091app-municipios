/**
 * API Route: Google Sheets Read
 * GET /api/mcp/sheets/read
 *
 * Lee datos de una hoja de Google Sheets
 */

import { readFromSheet } from '@/services/google-sheets';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { organization_id, user_id, spreadsheetId, sheetName, range } = body;

    // Validación
    if (!organization_id || !user_id || !spreadsheetId || !range) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Missing required fields: organization_id, user_id, spreadsheetId, range',
        },
        { status: 400 }
      );
    }

    const result = await readFromSheet({
      organization_id,
      user_id,
      spreadsheetId,
      sheetName: sheetName || 'Sheet1',
      range,
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
        values: result.values,
        rows: result.rows,
        columns: result.columns,
      },
    });
  } catch (error) {
    console.error('[API] Sheets Read Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
