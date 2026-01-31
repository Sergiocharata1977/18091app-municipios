'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChatSession } from '@/features/chat/types';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import {
  Clock,
  Loader2,
  MessageSquare,
  Play,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

// Interface local para la sesión con mensajes (para visualización)
interface SessionWithMessages extends ChatSession {
  messages?: Array<{
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    createdAt: Date;
  }>;
}

export default function HistorialConversacionesPage() {
  const { usuario } = useCurrentUser();
  const router = useRouter();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [selectedSession, setSelectedSession] =
    useState<SessionWithMessages | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );

  const loadSessions = useCallback(async () => {
    if (!usuario) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        userId: usuario.id,
        limit: '50',
      });

      // Usar nueva API /api/chat/sessions
      const response = await fetch(`/api/chat/sessions?${params}`);
      if (response.ok) {
        const data = await response.json();
        // Filtrar por búsqueda si hay query
        let filteredSessions = data.sessions || [];

        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filteredSessions = filteredSessions.filter(
            (s: ChatSession) =>
              s.title?.toLowerCase().includes(query) ||
              s.module?.toLowerCase().includes(query) ||
              s.tags?.some(t => t.toLowerCase().includes(query))
          );
        }

        if (selectedModule) {
          filteredSessions = filteredSessions.filter(
            (s: ChatSession) => s.module === selectedModule
          );
        }

        setSessions(filteredSessions);
      }
    } catch (error) {
      console.error('[HistorialConversaciones] Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  }, [usuario, searchQuery, selectedModule]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleViewSession = async (sessionId: string) => {
    if (!usuario) return;

    try {
      // Usar nueva API
      const response = await fetch(
        `/api/chat/sessions/${sessionId}?userId=${usuario.id}`
      );
      if (response.ok) {
        const data = await response.json();
        setSelectedSession({
          ...data.session,
          messages: data.messages,
        });
      }
    } catch (error) {
      console.error('[HistorialConversaciones] Error loading session:', error);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!usuario) return;

    try {
      // Usar nueva API
      const response = await fetch(
        `/api/chat/sessions/${sessionId}?userId=${usuario.id}`,
        {
          method: 'DELETE',
        }
      );

      if (response.ok) {
        setSessions(prev => prev.filter(s => s.id !== sessionId));
        setShowDeleteConfirm(null);
        if (selectedSession?.id === sessionId) {
          setSelectedSession(null);
        }
      }
    } catch (error) {
      console.error('[HistorialConversaciones] Error deleting session:', error);
    }
  };

  const handleContinueSession = (sessionId: string) => {
    // Save session ID to localStorage so chat can load it
    localStorage.setItem('resumeSessionId', sessionId);
    // Redirect to dashboard where the chat will open automatically
    router.push('/dashboard?openChat=true');
  };

  const getModules = () => {
    const modules = new Set(sessions.map(s => s.module).filter(Boolean));
    return Array.from(modules) as string[];
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!usuario) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex">
      {/* Sidebar - Lista de conversaciones */}
      <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800 mb-4">
            Historial de Conversaciones
          </h1>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar conversaciones..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Module filter */}
          {getModules().length > 0 && (
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedModule('')}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  selectedModule === ''
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Todos
              </button>
              {getModules().map(module => (
                <button
                  key={module}
                  onClick={() => setSelectedModule(module)}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    selectedModule === module
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {module}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sessions list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <MessageSquare className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-sm text-gray-500">
                No hay conversaciones
                {searchQuery || selectedModule ? ' que coincidan' : ''}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {sessions.map(session => (
                <div
                  key={session.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    selectedSession?.id === session.id ? 'bg-emerald-50' : ''
                  }`}
                  onClick={() => handleViewSession(session.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {session.module && (
                          <span className="text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded">
                            {session.module}
                          </span>
                        )}
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
                            session.status === 'active'
                              ? 'bg-blue-100 text-blue-700'
                              : session.status === 'paused'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {session.status === 'active'
                            ? 'activo'
                            : session.status === 'paused'
                              ? 'pausado'
                              : 'completado'}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-800 mb-1">
                        {session.title || 'Nueva conversación'}
                      </p>
                    </div>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setShowDeleteConfirm(session.id);
                      }}
                      className="text-gray-400 hover:text-red-600 transition-colors ml-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(session.updatedAt)}
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {session.messageCount} mensajes
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main content - Conversación seleccionada */}
      <div className="flex-1 bg-gray-50 flex flex-col">
        {selectedSession ? (
          <>
            {/* Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    {selectedSession.title || 'Conversación'}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {formatDate(selectedSession.createdAt)} a las{' '}
                    {formatTime(selectedSession.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleContinueSession(selectedSession.id)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Continuar conversación
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedSession(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedSession.messages?.map(msg => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-lg">👷‍♂️</span>
                    </div>
                  )}

                  <div className="flex flex-col max-w-[70%]">
                    <div
                      className={`p-3 rounded-lg ${
                        msg.role === 'user'
                          ? 'bg-blue-500 text-white rounded-br-none'
                          : 'bg-white text-gray-800 rounded-bl-none shadow-sm border border-gray-200'
                      }`}
                    >
                      <div className="text-sm whitespace-pre-wrap leading-relaxed">
                        {msg.content}
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 mt-1 px-1">
                      {formatTime(msg.createdAt)}
                    </span>
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-lg">👤</span>
                    </div>
                  )}
                </div>
              ))}

              {(!selectedSession.messages ||
                selectedSession.messages.length === 0) && (
                <div className="text-center py-8 text-gray-400">
                  No hay mensajes en esta conversación
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                Selecciona una conversación para ver los detalles
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              ¿Eliminar conversación?
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Esta acción no se puede deshacer. La conversación se eliminará
              permanentemente.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(null)}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDeleteSession(showDeleteConfirm)}
              >
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
