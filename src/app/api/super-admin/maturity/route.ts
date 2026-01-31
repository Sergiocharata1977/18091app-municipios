import { getAdminFirestore } from '@/lib/firebase/admin';
import { ImplementationMaturity, MaturityLevel } from '@/types/maturity';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // TODO: Verificar sesión de Super Admin aquí (middleware o headers)
    const adminDb = getAdminFirestore();

    // 1. Obtener todas las organizaciones
    const orgsSnapshot = await adminDb.collection('organizations').get();

    const results = [];

    // 2. Para cada organización, buscar su madurez
    for (const orgDoc of orgsSnapshot.docs) {
      const orgData = orgDoc.data();
      const maturityDoc = await adminDb
        .collection('organizations')
        .doc(orgDoc.id)
        .collection('maturity')
        .doc('current')
        .get();

      let maturityData: Partial<ImplementationMaturity> | null = null;

      if (maturityDoc.exists) {
        maturityData = maturityDoc.data() as ImplementationMaturity;
      }

      results.push({
        organizationId: orgDoc.id,
        name: orgData.name || 'Sin Nombre',
        plan: orgData.plan || 'Free',
        // Datos de madurez o defaults
        maturityLevel: maturityData?.globalLevel || MaturityLevel.INICIAL,
        maturityScore: maturityData?.globalScore || 0,
        lastUpdated: maturityData?.updatedAt
          ? (maturityData.updatedAt as any).toDate()
          : null,
        companySize: maturityData?.companySize || 'Unknown',
      });
    }

    // Ordenar por score descendente (los mejores primero)
    results.sort((a, b) => b.maturityScore - a.maturityScore);

    return NextResponse.json({ organizations: results });
  } catch (error) {
    console.error('Error fetching maturity stats:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
