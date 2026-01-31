'use client';

import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import type { Declaration } from '@/types/declarations';
import {
  DECLARATION_CATEGORY_LABELS,
  DECLARATION_STATUS_COLORS,
  DECLARATION_STATUS_LABELS,
} from '@/types/declarations';
import { AlertCircle, CheckCircle, Clock, Eye, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DeclarationsPage() {
  const router = useRouter();
  const [declarations, setDeclarations] = useState<Declaration[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadDeclarations();
  }, [filter]);

  const loadDeclarations = async () => {
    try {
      setLoading(true);
      const url =
        filter === 'all'
          ? '/api/declarations'
          : `/api/declarations?status=${filter}`;

      const response = await fetch(url);
      const result = await response.json();

      if (result.success) {
        setDeclarations(result.data || []);
      }
    } catch (error) {
      console.error('Error loading declarations:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: declarations.length,
    pending: declarations.filter(d => d.status === 'pending').length,
    reviewed: declarations.filter(d => d.status === 'reviewed').length,
    closed: declarations.filter(d => d.status === 'closed').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Declaraciones de Empleados
          </h1>
          <p className="text-gray-600 mt-1">
            Gestiona y revisa las declaraciones del personal
          </p>
        </div>
        <Link href="/declaraciones/nueva">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Declaración
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-yellow-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-800">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-900">
                {stats.pending}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-blue-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-800">Revisadas</p>
              <p className="text-2xl font-bold text-blue-900">
                {stats.reviewed}
              </p>
            </div>
            <Eye className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-green-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-800">Cerradas</p>
              <p className="text-2xl font-bold text-green-900">
                {stats.closed}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            size="sm"
          >
            Todas
          </Button>
          <Button
            variant={filter === 'pending' ? 'default' : 'outline'}
            onClick={() => setFilter('pending')}
            size="sm"
          >
            Pendientes
          </Button>
          <Button
            variant={filter === 'reviewed' ? 'default' : 'outline'}
            onClick={() => setFilter('reviewed')}
            size="sm"
          >
            Revisadas
          </Button>
          <Button
            variant={filter === 'closed' ? 'default' : 'outline'}
            onClick={() => setFilter('closed')}
            size="sm"
          >
            Cerradas
          </Button>
        </div>
      </div>

      {/* Declarations List */}
      <div className="bg-white rounded-lg border border-gray-200">
        {declarations.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No hay declaraciones
            </h3>
            <p className="text-gray-600">
              {filter === 'all'
                ? 'No se han registrado declaraciones aún'
                : `No hay declaraciones con estado "${DECLARATION_STATUS_LABELS[filter as keyof typeof DECLARATION_STATUS_LABELS] || filter}"`}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {declarations.map(declaration => (
              <div
                key={declaration.id}
                className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => router.push(`/declaraciones/${declaration.id}`)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-mono text-gray-500">
                        {declaration.declarationNumber}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                        {DECLARATION_CATEGORY_LABELS[declaration.category]}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${DECLARATION_STATUS_COLORS[declaration.status]}`}
                      >
                        {DECLARATION_STATUS_LABELS[declaration.status]}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {declaration.title}
                    </h3>

                    {/* Description Preview */}
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {declaration.description}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Por: {declaration.employeeName}</span>
                      <span>•</span>
                      <span>
                        {formatDate(
                          declaration.createdAt instanceof Date
                            ? declaration.createdAt
                            : new Date(declaration.createdAt)
                        )}
                      </span>
                      {declaration.reviewedByName && (
                        <>
                          <span>•</span>
                          <span>
                            Revisada por: {declaration.reviewedByName}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Action */}
                  <Button variant="outline" size="sm">
                    Ver Detalle
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
