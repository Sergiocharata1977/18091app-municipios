import { getAdminFirestore } from '@/lib/firebase/admin';
import {
  qualityObjectiveFiltersSchema,
  qualityObjectiveSchema,
} from '@/lib/validations/quality';
import { Timestamp } from 'firebase-admin/firestore';
import { NextRequest, NextResponse } from 'next/server';

const COLLECTION_NAME = 'quality_objectives';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse filters
    const filters = qualityObjectiveFiltersSchema.parse({
      search: searchParams.get('search') || undefined,
      status: (searchParams.get('status') as any) || undefined,
      type: (searchParams.get('type') as any) || undefined,
      process_definition_id:
        searchParams.get('process_definition_id') || undefined,
      responsible_user_id: searchParams.get('responsible_user_id') || undefined,
    });

    const db = getAdminFirestore();
    let query = db.collection(COLLECTION_NAME);

    // Si hay filtro por proceso, aplicarlo
    if (filters.process_definition_id) {
      query = query.where(
        'process_definition_id',
        '==',
        filters.process_definition_id
      ) as any;
    }

    const snapshot = await query.get();

    let objectives = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        created_at:
          data.created_at?.toDate?.().toISOString() || data.created_at,
        updated_at:
          data.updated_at?.toDate?.().toISOString() || data.updated_at,
        start_date:
          data.start_date?.toDate?.().toISOString() || data.start_date,
        due_date: data.due_date?.toDate?.().toISOString() || data.due_date,
      } as any;
    });

    // Apply additional filters
    if (filters.search) {
      objectives = objectives.filter(
        obj =>
          obj.title?.toLowerCase().includes(filters.search!.toLowerCase()) ||
          obj.code?.toLowerCase().includes(filters.search!.toLowerCase()) ||
          obj.description?.toLowerCase().includes(filters.search!.toLowerCase())
      );
    }

    if (filters.status) {
      objectives = objectives.filter(obj => obj.status === filters.status);
    }

    if (filters.type) {
      objectives = objectives.filter(obj => obj.type === filters.type);
    }

    if (filters.responsible_user_id) {
      objectives = objectives.filter(
        obj => obj.responsible_user_id === filters.responsible_user_id
      );
    }

    return NextResponse.json(objectives);
  } catch (error) {
    console.error('Error in quality objectives GET:', error);
    return NextResponse.json(
      { error: 'Error al obtener objetivos de calidad' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = qualityObjectiveSchema.parse(body);

    const db = getAdminFirestore();
    const now = Timestamp.now();

    const docData = {
      ...validatedData,
      status: validatedData.status || 'activo',
      progress_percentage: validatedData.progress_percentage || 0,
      current_value:
        validatedData.current_value || validatedData.baseline_value || 0,
      is_active: validatedData.is_active ?? true,
      created_at: now,
      updated_at: now,
    };

    const docRef = await db.collection(COLLECTION_NAME).add(docData);

    console.log('[QualityObjectives API] Created:', docRef.id);

    return NextResponse.json(
      {
        id: docRef.id,
        ...docData,
        created_at: now.toDate().toISOString(),
        updated_at: now.toDate().toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in quality objectives POST:', error);

    if (
      error &&
      typeof error === 'object' &&
      'name' in error &&
      error.name === 'ZodError'
    ) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: (error as any).errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al crear objetivo de calidad' },
      { status: 500 }
    );
  }
}
