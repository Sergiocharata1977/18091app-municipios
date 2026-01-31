/**
 * Hub Unificado de Planificación y Revisión por la Dirección
 * Actúa como Dashboard central sin romper la navegación existente.
 */

'use client';

import { PlanificacionListing } from '@/components/planificacion/PlanificacionListing';
import { StatusDonut } from '@/components/shared/StatusDonut';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { PlanBase, PlanCollectionType } from '@/types/planificacion';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import {
  AlertTriangle,
  BookOpen,
  Calendar,
  CheckCircle,
  FileText,
  Globe,
  History,
  Loader2,
  Plus,
  Target,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface SectionStatus {
  id: string;
  hasVigente: boolean;
  hasBorrador: boolean;
  count: number;
  lastUpdate?: Date;
  versionVigente?: number;
}

const SECTIONS = [
  {
    id: 'identidad',
    title: 'Identidad Organizacional',
    description: 'Misión, visión, valores y objetivos estratégicos',
    icon: BookOpen,
    collection: 'plan_identidad',
    color: 'emerald',
  },
  {
    id: 'alcance',
    title: 'Alcance del SGC',
    description: 'Límites, productos/servicios, ubicaciones y exclusiones',
    icon: Target,
    collection: 'plan_alcance',
    color: 'blue',
  },
  {
    id: 'contexto',
    title: 'Contexto de la Organización',
    description: 'Análisis interno, externo y partes interesadas',
    icon: Globe,
    collection: 'plan_contexto',
    color: 'purple',
  },
  {
    id: 'estructura',
    title: 'Estructura Organizacional',
    description: 'Organigrama, roles y responsabilidades',
    icon: Users,
    collection: 'plan_estructura',
    color: 'orange',
  },
  {
    id: 'politicas',
    title: 'Políticas',
    description: 'Política de calidad y otras políticas',
    icon: FileText,
    collection: 'plan_politicas',
    color: 'teal',
  },
];

const EXTRA_SECTIONS = [
  {
    id: 'amfe',
    title: 'AMFE - Riesgos',
    description: 'Análisis de riesgos y oportunidades',
    icon: AlertTriangle,
    href: '/planificacion-revision-direccion/amfe',
  },
  {
    id: 'reuniones',
    title: 'Reuniones de Revisión',
    description: 'Actas y seguimiento de reuniones por la dirección',
    icon: Calendar,
    href: '/planificacion-revision-direccion/reuniones',
  },
  {
    id: 'historial',
    title: 'Auditoría de Cambios',
    description: 'Histórico global de cambios en el módulo',
    icon: History,
    href: '/planificacion-revision-direccion/historial',
  },
];

export default function PlanificacionDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [statuses, setStatuses] = useState<Record<string, SectionStatus>>({});
  const [loading, setLoading] = useState(true);
  const [globalStats, setGlobalStats] = useState({
    completitud: 0,
    cumplimiento: 0,
  });

  // Modal control para acciones rápidas desde el Hub
  const [activeModal, setActiveModal] = useState<{
    type: PlanCollectionType;
    icon: any;
    mode: 'create' | 'list';
  } | null>(null);

  useEffect(() => {
    if (user?.organization_id) {
      loadStatuses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.organization_id]);

  const loadStatuses = async () => {
    if (!user?.organization_id) return;

    try {
      setLoading(true);
      const statusMap: Record<string, SectionStatus> = {};
      let totalSections = SECTIONS.length;
      let sectionsWithVigente = 0;
      let sectionsWithData = 0;

      for (const section of SECTIONS) {
        // Obtenemos un poco más de info para el dashboard
        const q = query(
          collection(db, section.collection),
          where('organization_id', '==', user.organization_id),
          orderBy('created_at', 'desc')
        );
        const snap = await getDocs(q);
        const docs = snap.docs.map(d => d.data() as PlanBase);

        const vigente = docs.find(d => d.estado === 'vigente');
        const count = docs.length;

        statusMap[section.id] = {
          id: section.id,
          hasVigente: !!vigente,
          hasBorrador: docs.some(d => d.estado === 'borrador'),
          count: count,
          lastUpdate: docs[0] ? new Date(docs[0].created_at) : undefined,
          versionVigente: vigente?.version_numero,
        };

        if (vigente) sectionsWithVigente++;
        if (count > 0) sectionsWithData++;
      }

      setStatuses(statusMap);
      setGlobalStats({
        completitud: Math.round((sectionsWithData / totalSections) * 100),
        cumplimiento: Math.round((sectionsWithVigente / totalSections) * 100),
      });
    } catch (error) {
      console.error('Error cargando estados:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mx-auto" />
          <p className="text-gray-500">Analizando el Sistema de Gestión...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 bg-slate-50/50 min-h-screen">
      {/* Header Hub */}
      <div className="flex flex-col md:flex-row gap-8 items-start justify-between">
        <div className="space-y-2 max-w-2xl">
          <Badge
            variant="outline"
            className="mb-2 bg-emerald-50 text-emerald-700 border-emerald-200"
          >
            ISO 9001:2015
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Planificación y Contexto
          </h1>
          <p className="text-gray-600 text-lg">
            Hub centralizado para definir el ADN de la organización. Desde aquí
            puede gestionar identidad, contexto, riesgos y estructura.
          </p>
        </div>

        {/* Status Donut Global */}
        <div className="bg-white p-4 rounded-xl shadow-sm border md:min-w-[400px]">
          <StatusDonut
            completitud={globalStats.completitud}
            cumplimiento={globalStats.cumplimiento}
          />
        </div>
      </div>

      <div className="border-t border-gray-200 my-8"></div>

      {/* Grid de Secciones Principales */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-600" />
            Definiciones Estratégicas
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {SECTIONS.map(section => {
            const status = statuses[section.id];
            const Icon = section.icon;
            // Cálculo de estado visual
            const isComplete = status?.hasVigente;
            const isInProgress = !isComplete && status?.count > 0;
            const borderColor = isComplete
              ? 'border-l-4 border-l-emerald-500'
              : isInProgress
                ? 'border-l-4 border-l-yellow-500'
                : 'border-l-4 border-l-gray-300';

            return (
              <Card
                key={section.id}
                className={`hover:shadow-lg transition-all duration-200 overflow-hidden group ${borderColor}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div
                      className={`p-2.5 rounded-lg bg-${section.color}-50 group-hover:bg-${section.color}-100 transition-colors`}
                    >
                      <Icon className={`w-6 h-6 text-${section.color}-600`} />
                    </div>
                    {status?.hasVigente ? (
                      <Badge className="bg-green-100 text-green-800 shadow-sm">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Vigente v{status.versionVigente}
                      </Badge>
                    ) : status?.hasBorrador ? (
                      <Badge className="bg-yellow-100 text-yellow-800 shadow-sm">
                        En Borrador
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-gray-500">
                        Pendiente
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="mt-4 text-lg">
                    {section.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 min-h-[40px]">
                    {section.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pb-2">
                  <div className="text-sm text-gray-500 flex items-center gap-2">
                    <History className="w-4 h-4" />
                    {status?.count || 0} versiones registradas
                  </div>
                  {status?.lastUpdate && (
                    <div className="text-xs text-gray-400 mt-1 ml-6">
                      Actualizado: {status.lastUpdate.toLocaleDateString()}
                    </div>
                  )}
                </CardContent>

                <CardFooter className="pt-2 flex gap-2 border-t mt-2 bg-slate-50/50 p-3">
                  {/* Botón: Ir a Sección (Navegación tradicional) */}
                  <Button
                    variant="ghost"
                    className="flex-1 text-xs h-8"
                    asChild
                  >
                    <Link
                      href={`/planificacion-revision-direccion/${section.id}`}
                    >
                      Ir a Sección
                    </Link>
                  </Button>

                  {/* Botón: Ver Historial (Modal Rápido) */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs h-8 bg-white"
                    onClick={() =>
                      setActiveModal({
                        type: section.id as any,
                        icon: Icon,
                        mode: 'list',
                      })
                    }
                  >
                    Historial
                  </Button>

                  {/* Botón: Nueva Versión (Acción Directa) */}
                  <Button
                    variant="default"
                    size="sm"
                    className="flex-1 text-xs h-8 bg-slate-900 hover:bg-slate-800"
                    onClick={() =>
                      setActiveModal({
                        type: section.id as any,
                        icon: Icon,
                        mode: 'create',
                      })
                    }
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Nueva
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Grid de Gestión Adicional */}
      <div className="pt-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600" />
          Herramientas de Gestión
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {EXTRA_SECTIONS.map(section => {
            const Icon = section.icon;

            return (
              <Link key={section.id} href={section.href}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full border-dashed hover:border-solid">
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className="p-3 rounded-full bg-blue-50 mt-1">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-base">
                        {section.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                        {section.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Modal Genérico para Acciones Rápidas del Hub */}
      {activeModal && user?.organization_id && (
        <Dialog
          open={!!activeModal}
          onOpenChange={open => !open && setActiveModal(null)}
        >
          <DialogContent className="max-w-[80vw] p-0 border-0 bg-transparent shadow-none [&>button]:hidden">
            {/* El propio componente PlanificacionListing maneja su UI interna de modal si quiere,
                 pero aquí lo usamos en modo 'list' o 'create' que ya incluye su layout.
                 Para que se vea bien dentro del Dialog de Shadcn, podemos envolverlo en un div blanco.
             */}
            <div className="bg-white rounded-lg shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
              <div className="flex justify-end p-2 bg-slate-50 border-b">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveModal(null)}
                >
                  Cerrar
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <PlanificacionListing
                  tipo={activeModal.type}
                  organizationId={user.organization_id}
                  userEmail={user.email || ''}
                  icon={activeModal.icon}
                  initialMode={activeModal.mode}
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
