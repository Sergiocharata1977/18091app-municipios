'use client';

import { SurveyFormDialog } from '@/components/surveys/SurveyFormDialog';
import { Button } from '@/components/ui/button';
import type { Survey } from '@/types/surveys';
import {
  SURVEY_STATUS_COLORS,
  SURVEY_STATUS_LABELS,
  SURVEY_TYPE_LABELS,
} from '@/types/surveys';
import { FileText, Plus, Star } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function SurveysPage() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    loadSurveys();
  }, []);

  const loadSurveys = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/surveys');
      const result = await response.json();

      if (result.success) {
        setSurveys(result.data || []);
      }
    } catch (error) {
      console.error('Error loading surveys:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    loadSurveys();
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
            Encuestas de Satisfacción
          </h1>
          <p className="text-gray-600 mt-1">
            Gestiona encuestas de clientes y analiza resultados
          </p>
        </div>
        <Button onClick={() => setShowDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Encuesta
        </Button>
      </div>

      {/* Survey List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {surveys.length === 0 ? (
          <div className="col-span-full bg-white rounded-lg border border-gray-200 p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No hay encuestas
            </h3>
            <p className="text-gray-600 mb-4">
              Crea tu primera encuesta para comenzar a recopilar feedback
            </p>
            <Button onClick={() => setShowDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Crear Encuesta
            </Button>
          </div>
        ) : (
          surveys.map(survey => (
            <Link
              key={survey.id}
              href={`/encuestas/${survey.id}`}
              className="block"
            >
              <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <span className="text-xs font-mono text-gray-500">
                      {survey.surveyNumber}
                    </span>
                    <h3 className="text-lg font-semibold text-gray-900 mt-1 line-clamp-2">
                      {survey.title}
                    </h3>
                  </div>
                </div>

                {/* Type and Status */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                    {SURVEY_TYPE_LABELS[survey.type]}
                  </span>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded ${SURVEY_STATUS_COLORS[survey.status]}`}
                  >
                    {SURVEY_STATUS_LABELS[survey.status]}
                  </span>
                </div>

                {/* Stats */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Respuestas</span>
                    <span className="font-semibold text-gray-900">
                      {survey.responseCount}
                    </span>
                  </div>
                  {survey.averageRating && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Promedio</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-semibold text-gray-900">
                          {survey.averageRating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="text-xs text-gray-500 pt-2 border-t">
                    {survey.questions.length} preguntas
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Dialog */}
      <SurveyFormDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
