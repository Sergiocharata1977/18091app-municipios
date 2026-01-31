import { AuditService } from '@/services/audits/AuditService';
import { NextRequest, NextResponse } from 'next/server';

// ============================================
// POST - Completar auditoría
// ============================================

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await AuditService.complete(params.id);

    return NextResponse.json({
      message: 'Auditoría completada exitosamente',
    });
  } catch (error: unknown) {
    console.error('Error in POST /api/audits/[id]/complete:', error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Error al completar la auditoría' },
      { status: 500 }
    );
  }
}
