'use client';

import { NormPointsList } from '@/components/normPoints/NormPointsList';

export default function PuntosNormaPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Puntos de Norma</h1>
        <p className="text-muted-foreground">
          Gestión de requisitos normativos ISO 9001:2015
        </p>
        <p className="text-sm text-slate-500 mt-2">
          💡 Para ver el Dashboard de Cumplimiento y Análisis de Gaps, visita el{' '}
          <a
            href="/noticias"
            className="text-emerald-600 hover:underline font-medium"
          >
            Centro Principal
          </a>
        </p>
      </div>

      {/* Solo la lista de gestión de puntos */}
      <NormPointsList />
    </div>
  );
}
