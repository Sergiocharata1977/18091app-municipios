'use client';

import { MCPExecutionList } from '@/components/mcp/MCPExecutionList';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { MCPTaskExecution } from '@/types/mcp';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function MCPHistoryPage() {
  const { user } = useAuth();
  const [executions, setExecutions] = useState<MCPTaskExecution[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!user?.organization_id) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/mcp/ejecuciones?organization_id=${user.organization_id}&limit=50`
      );
      const data = await res.json();
      if (data.success) {
        setExecutions(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/mcp">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Historial de Ejecuciones
            </h1>
            <p className="text-gray-500">
              Registro completo de actividades del Mini Copiloto
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={loadData} disabled={loading}>
          <RefreshCw
            className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`}
          />
          Actualizar
        </Button>
      </div>

      <div className="bg-white rounded-lg border shadow-sm p-4">
        <MCPExecutionList executions={executions} />
      </div>
    </div>
  );
}
