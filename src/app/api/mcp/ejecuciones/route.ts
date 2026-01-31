import { getAdminFirestore } from '@/lib/firebase/admin';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('organization_id');
    const limitParam = searchParams.get('limit');

    if (!orgId) {
      return NextResponse.json(
        { success: false, error: 'Missing organization_id' },
        { status: 400 }
      );
    }

    const db = getAdminFirestore();
    let query = db
      .collection('mcp_executions')
      .where('organization_id', '==', orgId)
      .orderBy('created_at', 'desc');

    if (limitParam) {
      const limit = parseInt(limitParam);
      if (!isNaN(limit)) {
        query = query.limit(limit);
      }
    } else {
      query = query.limit(50); // Default safety limit
    }

    const snapshot = await query.get();

    // Transform data to Serialized format (timestamps to Dates/Strings)
    const data = snapshot.docs.map(doc => {
      const d = doc.data();
      return {
        id: doc.id,
        ...d,
        // Convert Timestamps to ISO strings for easier client handling logic if needed,
        // but our client component handles {seconds, nanoseconds} object too.
        // We'll leave it as is to preserve fidelity, next.js json() handles it.
      };
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Error fetching MCP executions:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
