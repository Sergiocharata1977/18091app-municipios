import { getAdminFirestore } from '@/lib/firebase/admin';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Extract filters
    const tipoNorma =
      searchParams.get('tipo_norma') || searchParams.get('tipoNorma');
    const chapter = searchParams.get('chapter');
    const search = searchParams.get('search');

    // Pagination
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Use admin firestore directly - collection is 'normPoints' (camelCase based on Firebase console)
    const db = getAdminFirestore();
    let query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> =
      db.collection('normPoints');

    // Apply tipo_norma filter if provided
    if (tipoNorma) {
      query = query.where('tipo_norma', '==', tipoNorma);
    }

    // Apply chapter filter if provided
    if (chapter) {
      query = query.where('chapter', '==', chapter);
    }

    const snapshot = await query.get();

    console.log(
      `[norm-points API] Found ${snapshot.docs.length} documents in norm_points collection`
    );

    let normPoints = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Filter out soft-deleted items in memory (if field exists)
    normPoints = normPoints.filter((np: any) => !np.deletedAt);

    // In-memory search filter
    if (search) {
      const searchLower = search.toLowerCase();
      normPoints = normPoints.filter(
        (np: any) =>
          (np.requirement &&
            np.requirement.toLowerCase().includes(searchLower)) ||
          (np.description &&
            np.description.toLowerCase().includes(searchLower)) ||
          (np.title && np.title.toLowerCase().includes(searchLower)) ||
          (np.code && np.code.toLowerCase().includes(searchLower))
      );
    }

    // Sort by code/chapter in memory
    normPoints.sort((a: any, b: any) => {
      const codeA = a.code || a.chapter || '';
      const codeB = b.code || b.chapter || '';
      return codeA.localeCompare(codeB, undefined, { numeric: true });
    });

    // Pagination in memory
    const paginatedPoints = normPoints.slice(offset, offset + limit);

    console.log(
      `[norm-points API] Returning ${paginatedPoints.length} norm points`
    );

    return NextResponse.json({
      success: true,
      data: paginatedPoints,
      count: normPoints.length,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error in GET /api/sdk/norm-points:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener puntos de norma',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ error: 'Not implemented' }, { status: 501 });
}
