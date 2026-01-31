'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Activity, ListChecks, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Finding, FindingsList } from './FindingsList';
import { HealthGauge } from './HealthGauge';

// Mock Data inicial (luego se conectará con la API real)
const MOCK_FINDINGS: Finding[] = [
  {
    id: '1',
    code: 'DOC-001',
    title: 'Política de Calidad Vencida',
    severity: 'CRITICAL',
    evidence: 'Last Review: 540 days ago (Limit: 365)',
    daysOpen: 12,
  },
  {
    id: '2',
    code: 'AUTH-002',
    title: 'Segregación de Funciones Inválida',
    severity: 'HIGH',
    evidence: 'Author (J.Perez) == Approver',
    daysOpen: 2,
  },
  {
    id: '3',
    code: 'AUD-005',
    title: 'Auditoría sin Cierre Formal',
    severity: 'MEDIUM',
    evidence: 'Audit #2023-Q4 is OPEN since Dec 2023',
    daysOpen: 45,
  },
  {
    id: '4',
    code: 'ACT-012',
    title: 'Acción Correctiva Pendiente',
    severity: 'HIGH',
    evidence: 'Deadline passed 7 days ago',
    daysOpen: 7,
  },
  {
    id: '5',
    code: 'RRHH-001',
    title: 'Certificación de Auditor Vencida',
    severity: 'LOW',
    evidence: 'M.Garcia cert expired yesterday',
    daysOpen: 1,
  },
];

export function GovernanceDashboard() {
  const [score, setScore] = useState(85);
  const [findings, setFindings] = useState(MOCK_FINDINGS);

  const handleFix = (id: string) => {
    // Simulación de "Fix"
    setFindings(prev => prev.filter(f => f.id !== id));
    setScore(prev => Math.min(100, prev + 5));
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-200 p-6 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-blue-500" />
            Governance Monitor
          </h1>
          <p className="text-slate-400 max-w-2xl">
            Sistema de vigilancia activa de principios ISO 9001. El agente
            monitorea anomalías y riesgos de cumplimiento en tiempo real.
          </p>
        </div>

        {/* Health KPI */}
        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm min-w-[300px]">
          <HealthGauge score={score} trend={2.5} />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Findings List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5 text-orange-500" />
              Hallazgos Activos
              <span className="bg-slate-800 text-xs px-2 py-1 rounded-full text-slate-400">
                {findings.length}
              </span>
            </h3>
          </div>

          <FindingsList findings={findings} onFix={handleFix} />

          {findings.length === 0 && (
            <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl bg-slate-900/20">
              <ShieldCheck className="w-12 h-12 text-green-500 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-medium text-slate-300">
                All Systems Operational
              </h3>
              <p className="text-slate-500">
                No governance risks detected at this time.
              </p>
            </div>
          )}
        </div>

        {/* Sidebar / Quick Stats */}
        <div className="space-y-6">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-wider text-slate-500">
                Compliance by Domain
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <DomainProgress
                label="Document Control"
                percent={92}
                color="bg-green-500"
              />
              <DomainProgress
                label="Audit Management"
                percent={65}
                color="bg-orange-500"
              />
              <DomainProgress
                label="Risk & Issues"
                percent={88}
                color="bg-blue-500"
              />
              <DomainProgress
                label="HR & Competence"
                percent={100}
                color="bg-green-500"
              />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-900/20 to-slate-900/50 border-blue-500/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400">
                  <ListChecks className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">
                    Night Watch Active
                  </h4>
                  <p className="text-sm text-slate-400">
                    El agente escaneó 145 documentos y 32 auditorías hace 4
                    horas.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DomainProgress({
  label,
  percent,
  color,
}: {
  label: string;
  percent: number;
  color: string;
}) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-slate-300">{label}</span>
        <span className="font-mono text-slate-400">{percent}%</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          className={`h-full ${color}`}
        />
      </div>
    </div>
  );
}
