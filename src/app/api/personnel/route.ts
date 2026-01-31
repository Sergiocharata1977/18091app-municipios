import { PersonnelService } from '@/services/rrhh/PersonnelService';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/personnel - Obtener todo el personal
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organization_id');

    if (!organizationId) {
      return NextResponse.json(
        { error: 'organization_id es requerido' },
        { status: 400 }
      );
    }

    const personnel = await PersonnelService.getAll(organizationId);
    return NextResponse.json(personnel);
  } catch (error) {
    console.error('Error getting personnel:', error);
    return NextResponse.json(
      { error: 'Error al obtener personal' },
      { status: 500 }
    );
  }
}
