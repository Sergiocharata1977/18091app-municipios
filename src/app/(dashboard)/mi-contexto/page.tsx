'use client';

import { useCurrentUser } from '@/hooks/useCurrentUser';
import { InformacionPersonalCard } from '@/components/context/InformacionPersonalCard';
import { ProcesosAsignadosCard } from '@/components/context/ProcesosAsignadosCard';
import { ObjetivosCalidadCard } from '@/components/context/ObjetivosCalidadCard';
import { IndicadoresCard } from '@/components/context/IndicadoresCard';

export default function MiContextoPage() {
  const { contexto, loading, error } = useCurrentUser({ includeContext: true });

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando tu contexto...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-900 mb-2">
            Error al cargar contexto
          </h2>
          <p className="text-red-700">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!contexto) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-yellow-900 mb-2">
            Contexto no disponible
          </h2>
          <p className="text-yellow-700">
            No se pudo cargar tu información de contexto. Por favor, contacta al
            administrador.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mi Contexto</h1>
        <p className="text-gray-600 mt-2">
          Esta es la información que Don Cándido conoce sobre ti y tu rol en la
          organización.
        </p>
      </div>

      {/* Cards */}
      <InformacionPersonalCard contexto={contexto} />
      <ProcesosAsignadosCard
        procesos={contexto.procesos}
        processRecords={contexto.processRecords}
      />
      <ObjetivosCalidadCard objetivos={contexto.objetivos} />
      <IndicadoresCard indicadores={contexto.indicadores} />
    </div>
  );
}
