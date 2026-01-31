import { auth } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { getTaskStats, getUserTasks } from '@/services/user-tasks';
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  Timestamp,
  where,
} from 'firebase/firestore';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/users/[id]/dashboard
 * Obtiene los datos del dashboard personal del usuario
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const isOwner = session.user.id === userId;
    const isAdmin = session.user.rol === 'admin';

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    // Obtener datos en paralelo
    const [taskStats, urgentTasks, upcomingAudits, openFindings] =
      await Promise.all([
        getTaskStats(userId),
        getUserTasks(userId, { status: ['pending', 'in_progress'] }),
        getUpcomingAudits(userId),
        getOpenFindings(userId),
      ]);

    const summary = {
      pending_tasks: taskStats.pending,
      active_goals: 0, // TODO: implementar cuando tengamos goals
      upcoming_audits: upcomingAudits.length,
      open_findings: openFindings.length,
    };

    // Actividad reciente
    const recent_activity = [
      ...urgentTasks.slice(0, 3).map(t => ({
        type: 'task',
        title: t.title,
        date: t.created_at,
      })),
      ...upcomingAudits.slice(0, 2).map(a => ({
        type: 'audit',
        title: (a as any).title,
        date: a.plannedDate,
      })),
    ]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 5);

    return NextResponse.json({
      summary,
      tasks: urgentTasks.slice(0, 5),
      goals: [], // TODO
      recent_activity,
    });
  } catch (error) {
    console.error('Error al obtener dashboard:', error);
    return NextResponse.json(
      { error: 'Error al obtener dashboard' },
      { status: 500 }
    );
  }
}

/**
 * Obtiene las auditorías próximas del usuario
 */
async function getUpcomingAudits(userId: string) {
  const now = new Date();
  const auditsRef = collection(db, 'audits');

  const q = query(
    auditsRef,
    where('participants', 'array-contains', userId),
    where('plannedDate', '>=', now),
    orderBy('plannedDate', 'asc'),
    limit(10)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    plannedDate: (doc.data().plannedDate as Timestamp)?.toDate(),
  }));
}

/**
 * Obtiene los hallazgos abiertos relacionados al usuario
 */
async function getOpenFindings(userId: string) {
  const findingsRef = collection(db, 'findings');

  const q = query(
    findingsRef,
    where('responsibleId', '==', userId),
    where('status', '==', 'open'),
    limit(20)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
}
