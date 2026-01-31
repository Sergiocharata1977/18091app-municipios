'use client';

import { DonCandidoAvatar } from '@/components/ui/DonCandidoAvatar';
import {
  FASES_ISO_9001,
  getInitialJourneyProgress,
  PhaseProgress,
} from '@/features/journey/types/journey';
import { cn } from '@/lib/utils';
import { ChevronRight, Clock, Lock, Target } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function RoadmapTab() {
  const [progress] = useState<PhaseProgress[]>(getInitialJourneyProgress());

  const totalTareas = FASES_ISO_9001.reduce(
    (acc, f) => acc + f.tareas.filter(t => t.esRequerida).length,
    0
  );
  const tareasCompletadas = progress.reduce(
    (acc, p) => acc + p.tareasCompletadas.length,
    0
  );
  const progresoGlobal = Math.round((tareasCompletadas / totalTareas) * 100);
  const faseActual =
    progress.find(p => p.status === 'in_progress') ||
    progress.find(p => p.status === 'available');

  return (
    <div className="space-y-6">
      {/* Header con progreso */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-white/20 rounded-full p-2 flex-shrink-0">
            <DonCandidoAvatar mood="saludo" className="w-full h-full" />
          </div>
          <div className="flex-1 text-white">
            <h2 className="text-xl md:text-2xl font-bold mb-2">
              Tu Camino hacia ISO 9001
            </h2>
            <p className="text-emerald-100 text-sm">
              6 fases para implementar tu Sistema de Gestión de Calidad
            </p>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex justify-between text-sm text-white/80 mb-2">
            <span>Progreso Global</span>
            <span className="font-bold text-white">{progresoGlobal}%</span>
          </div>
          <div className="h-3 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${progresoGlobal}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-white/60 mt-2">
            <span>
              {tareasCompletadas} de {totalTareas} tareas
            </span>
            {faseActual && (
              <span>
                Fase actual:{' '}
                {FASES_ISO_9001.find(f => f.id === faseActual.phaseId)
                  ?.nombreCorto || ''}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Timeline de Fases */}
      <div className="space-y-4">
        {FASES_ISO_9001.map(fase => {
          const faseProgress = progress.find(p => p.phaseId === fase.id);
          const status = faseProgress?.status || 'locked';
          const porcentaje = faseProgress?.porcentaje || 0;
          const isLocked = status === 'locked';
          const isCompleted = status === 'completed';
          const isActive = status === 'in_progress' || status === 'available';

          return (
            <div
              key={fase.id}
              className={cn(
                'bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all',
                isLocked && 'opacity-60',
                isActive && 'ring-2 ring-emerald-500'
              )}
            >
              <div className={cn('p-5 bg-gradient-to-r', fase.colorPrimario)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{fase.icono}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white/70 text-xs font-medium">
                          FASE {fase.id}
                        </span>
                        {isCompleted && (
                          <span className="px-2 py-0.5 bg-white/20 rounded-full text-white text-xs">
                            ✓ Completada
                          </span>
                        )}
                        {isActive && !isCompleted && (
                          <span className="px-2 py-0.5 bg-white/20 rounded-full text-white text-xs animate-pulse">
                            En progreso
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-white">
                        {fase.nombre}
                      </h3>
                    </div>
                  </div>
                  {!isLocked ? (
                    <Link
                      href={`/journey/${fase.id}`}
                      className="flex items-center gap-1 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm font-medium transition-colors"
                    >
                      Ver <ChevronRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <Lock className="w-5 h-5 text-white/50" />
                  )}
                </div>
                {isActive && (
                  <div className="mt-3">
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white rounded-full transition-all"
                        style={{ width: `${porcentaje}%` }}
                      />
                    </div>
                    <p className="text-white/80 text-xs mt-1">
                      {porcentaje}% completado
                    </p>
                  </div>
                )}
              </div>

              <div className="p-4">
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                  {fase.descripcion}
                </p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {fase.clausulasISO.map(c => (
                    <span
                      key={c}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-300"
                    >
                      Cláusula {c}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    <span>
                      {fase.tareas.filter(t => t.esRequerida).length} tareas
                      requeridas
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>~2-3 semanas</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
