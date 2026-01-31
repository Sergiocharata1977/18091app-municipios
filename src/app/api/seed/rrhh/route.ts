import { seedRRHHData } from '@/lib/seed/rrhh-seed';
import { NextResponse } from 'next/server';

// Forzar ruta dinámica - no ejecutar durante build
export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    console.log('🚀 Iniciando seed de datos RRHH...');

    await seedRRHHData();

    return NextResponse.json({
      success: true,
      message: 'Datos RRHH sembrados exitosamente',
    });
  } catch (error) {
    console.error('❌ Error en seed RRHH:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al sembrar datos RRHH',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
