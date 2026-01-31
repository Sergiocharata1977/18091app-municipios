import { seedRRHHData } from '@/lib/seed/rrhh-seed';
import { DepartmentService } from '@/services/rrhh/DepartmentService';
import { EvaluationService } from '@/services/rrhh/EvaluationService';
import { PersonnelService } from '@/services/rrhh/PersonnelService';
import { PositionService } from '@/services/rrhh/PositionService';
import { TrainingService } from '@/services/rrhh/TrainingService';
import { NextResponse } from 'next/server';

// Forzar ruta dinámica - no ejecutar durante build
export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    console.log('🔄 Iniciando limpieza y seed completo de datos RRHH...');

    // Limpiar datos existentes
    console.log('🧹 Limpiando datos existentes...');

    // Use a fixed organization ID for checking
    const SEED_ORG_ID = 'seed-organization-id';

    const departments = await DepartmentService.getAll(SEED_ORG_ID);
    const personnel = await PersonnelService.getAll(SEED_ORG_ID);
    const positions = await PositionService.getAll(SEED_ORG_ID);
    const trainings = await TrainingService.getAll(SEED_ORG_ID);
    const evaluations = await EvaluationService.getAll(SEED_ORG_ID);

    // Eliminar en orden inverso para evitar problemas de dependencias
    for (const evaluation of evaluations) {
      await EvaluationService.delete(evaluation.id);
    }
    for (const training of trainings) {
      await TrainingService.delete(training.id);
    }
    for (const person of personnel) {
      await PersonnelService.delete(person.id);
    }
    for (const position of positions) {
      await PositionService.delete(position.id);
    }
    for (const department of departments) {
      await DepartmentService.delete(department.id);
    }

    console.log('✅ Limpieza completada');

    // Sembrar nuevos datos
    console.log('🌱 Sembrando nuevos datos...');
    await seedRRHHData();

    return NextResponse.json({
      success: true,
      message: 'Datos RRHH limpiados y sembrados exitosamente',
      deleted: {
        departments: departments.length,
        positions: positions.length,
        personnel: personnel.length,
        trainings: trainings.length,
        evaluations: evaluations.length,
      },
    });
  } catch (error) {
    console.error('❌ Error en limpieza y seed RRHH:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al limpiar y sembrar datos RRHH',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
