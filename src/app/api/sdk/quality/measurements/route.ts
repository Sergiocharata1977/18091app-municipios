/**
 * Measurements API Route - SDK Unified
 *
 * GET /api/sdk/quality/measurements - List measurements
 * POST /api/sdk/quality/measurements - Create measurement
 */

import { NextRequest, NextResponse } from 'next/server';
import { MeasurementService } from '@/lib/sdk/modules/quality';
import { CreateMeasurementSchema } from '@/lib/sdk/modules/quality/validations';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const indicatorId = searchParams.get('indicatorId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const service = new MeasurementService();
    let measurements;

    if (indicatorId) {
      measurements = await service.getByIndicator(indicatorId);
    } else if (startDate && endDate) {
      measurements = await service.getByDateRange(startDate, endDate);
    } else {
      measurements = await service.list({}, { limit, offset });
    }

    return NextResponse.json(
      { data: measurements, count: measurements.length },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/sdk/quality/measurements:', error);
    return NextResponse.json(
      {
        error: 'Error al obtener mediciones',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = CreateMeasurementSchema.parse(body);

    const service = new MeasurementService();
    const id = await service.createAndReturnId(validated, 'system');

    return NextResponse.json(
      { id, message: 'Medición creada exitosamente' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/sdk/quality/measurements:', error);
    return NextResponse.json(
      {
        error: 'Error al crear medición',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
