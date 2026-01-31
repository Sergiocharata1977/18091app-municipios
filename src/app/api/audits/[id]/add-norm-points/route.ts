import { db } from '@/firebase/config';
import { AuditService } from '@/lib/sdk/modules/audits/AuditService';
import { doc, updateDoc } from 'firebase/firestore';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { normPointCodes } = await request.json();
    const auditId = params.id;

    if (!normPointCodes || !Array.isArray(normPointCodes)) {
      return NextResponse.json(
        {
          success: false,
          message: 'normPointCodes es requerido y debe ser un array',
        },
        { status: 400 }
      );
    }

    const auditService = new AuditService();
    const audit = await auditService.getById(auditId);

    if (!audit) {
      return NextResponse.json(
        { success: false, message: 'Auditoría no encontrada' },
        { status: 404 }
      );
    }

    // Create new norm point verifications
    const newVerifications = normPointCodes.map((code: string) => ({
      normPointCode: code,
      normPointId: null,
      conformityStatus: null,
      processes: [],
      processIds: null,
      observations: null,
      verifiedAt: null,
      verifiedBy: null,
      verifiedByName: null,
    }));

    // Merge with existing verifications (avoid duplicates)
    const existingCodes =
      audit.normPointsVerification?.map(v => v.normPointCode) || [];
    const uniqueNewVerifications = newVerifications.filter(
      v => !existingCodes.includes(v.normPointCode)
    );

    const updatedVerifications = [
      ...(audit.normPointsVerification || []),
      ...uniqueNewVerifications,
    ];

    // Update audit using direct Firebase
    const auditRef = doc(db, 'audits', auditId);
    await updateDoc(auditRef, {
      normPointsVerification: updatedVerifications,
      selectedNormPoints: updatedVerifications.map(v => v.normPointCode),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: `${uniqueNewVerifications.length} puntos de norma agregados`,
    });
  } catch (error) {
    console.error('Error adding norm points:', error);
    return NextResponse.json(
      { success: false, message: 'Error al agregar puntos de norma' },
      { status: 500 }
    );
  }
}
