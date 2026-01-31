import { db } from '@/firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const querySnapshot = await getDocs(collection(db, 'normPoints'));

    const points = querySnapshot.docs.map(doc => ({
      id: doc.id,
      code: doc.data().code,
      chapter: doc.data().chapter,
      chapterType: typeof doc.data().chapter,
      title: doc.data().title,
    }));

    // Agrupar por capítulo
    const byChapter: Record<string, number> = {};
    points.forEach(p => {
      const ch = String(p.chapter || 'sin_capitulo');
      byChapter[ch] = (byChapter[ch] || 0) + 1;
    });

    return NextResponse.json({
      total: points.length,
      byChapter,
      sample: points.slice(0, 10),
      allCodes: points.map(p => p.code).sort(),
    });
  } catch (error) {
    console.error('Error in diagnostics:', error);
    return NextResponse.json(
      { error: 'Error en diagnóstico' },
      { status: 500 }
    );
  }
}
