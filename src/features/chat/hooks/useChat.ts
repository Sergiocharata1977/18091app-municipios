// Hook principal para el sistema de chat
// Gestiona estado, sesiones y mensajes

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AIMode,
  ChatConfig,
  ChatMessage,
  ChatSession,
  ChatState,
  DEFAULT_CHAT_CONFIG,
} from '../types';

interface UseChatOptions {
  userId: string;
  module?: string;
  autoCreateSession?: boolean;
}

interface UseChatReturn {
  // Estado
  state: ChatState;
  config: ChatConfig;

  // Sesiones
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  loadSessions: () => Promise<void>;
  selectSession: (sessionId: string) => Promise<void>;
  createSession: () => Promise<ChatSession | null>;
  deleteSession: (sessionId: string) => Promise<void>;

  // Mensajes
  messages: ChatMessage[];
  sendMessage: (content: string, inputType?: 'text' | 'voice') => Promise<void>;

  // Configuración
  setAIMode: (mode: AIMode) => void;
  setAutoPlayVoice: (enabled: boolean) => void;
  setContinuousMode: (enabled: boolean) => void;
  setDarkMode: (enabled: boolean) => void;

  // Utilidades
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  clearError: () => void;
}

export function useChat(options: UseChatOptions): UseChatReturn {
  const { userId, module, autoCreateSession = true } = options;

  // Estado principal
  const [state, setState] = useState<ChatState>({
    status: 'idle',
    currentSession: null,
    messages: [],
    error: null,
  });

  // Configuración
  const [config, setConfig] = useState<ChatConfig>(DEFAULT_CHAT_CONFIG);

  // Lista de sesiones
  const [sessions, setSessions] = useState<ChatSession[]>([]);

  // Refs para evitar race conditions
  const isInitialized = useRef(false);
  const abortController = useRef<AbortController | null>(null);

  // ============================================
  // SESIONES
  // ============================================

  const loadSessions = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await fetch(`/api/chat/sessions?userId=${userId}`);

      if (!response.ok) {
        throw new Error('Failed to load sessions');
      }

      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (error) {
      console.error('[useChat] Error loading sessions:', error);
    }
  }, [userId]);

  const createSession = useCallback(async (): Promise<ChatSession | null> => {
    if (!userId) return null;

    setState(prev => ({ ...prev, status: 'connecting' }));

    try {
      const response = await fetch('/api/chat/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          type: 'advisor',
          module,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create session');
      }

      const data = await response.json();
      const session = data.session as ChatSession;

      setState(prev => ({
        ...prev,
        status: 'ready',
        currentSession: session,
        messages: [],
        error: null,
      }));

      // Añadir a la lista de sesiones
      setSessions(prev => [session, ...prev]);

      console.log('[useChat] Session created:', session.id);
      return session;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error creating session';
      setState(prev => ({ ...prev, status: 'error', error: errorMessage }));
      return null;
    }
  }, [userId, module]);

  const selectSession = useCallback(
    async (sessionId: string) => {
      if (!userId) return;

      setState(prev => ({ ...prev, status: 'connecting' }));

      try {
        const response = await fetch(
          `/api/chat/sessions/${sessionId}?userId=${userId}`
        );

        if (!response.ok) {
          throw new Error('Failed to load session');
        }

        const data = await response.json();

        setState(prev => ({
          ...prev,
          status: 'ready',
          currentSession: data.session,
          messages: data.messages || [],
          error: null,
        }));

        console.log('[useChat] Session selected:', sessionId);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Error loading session';
        setState(prev => ({ ...prev, status: 'error', error: errorMessage }));
      }
    },
    [userId]
  );

  const deleteSession = useCallback(
    async (sessionId: string) => {
      if (!userId) return;

      try {
        const response = await fetch(
          `/api/chat/sessions/${sessionId}?userId=${userId}`,
          { method: 'DELETE' }
        );

        if (!response.ok) {
          throw new Error('Failed to delete session');
        }

        // Remover de la lista
        setSessions(prev => prev.filter(s => s.id !== sessionId));

        // Si era la sesión actual, limpiar estado
        if (state.currentSession?.id === sessionId) {
          setState(prev => ({
            ...prev,
            currentSession: null,
            messages: [],
          }));
        }

        console.log('[useChat] Session deleted:', sessionId);
      } catch (error) {
        console.error('[useChat] Error deleting session:', error);
      }
    },
    [userId, state.currentSession?.id]
  );

  // ============================================
  // MENSAJES
  // ============================================

  const sendMessage = useCallback(
    async (content: string, inputType: 'text' | 'voice' = 'text') => {
      if (!userId || !content.trim()) return;

      // Crear sesión si no existe
      let sessionId = state.currentSession?.id;
      if (!sessionId) {
        const newSession = await createSession();
        if (!newSession) return;
        sessionId = newSession.id;
      }

      // Cancelar request anterior si existe
      if (abortController.current) {
        abortController.current.abort();
      }
      abortController.current = new AbortController();

      setState(prev => ({ ...prev, status: 'sending' }));

      // Añadir mensaje del usuario optimistamente
      const tempUserMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        sessionId,
        organizationId: '',
        role: 'user',
        content,
        inputType,
        createdAt: new Date(),
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, tempUserMessage],
      }));

      try {
        const response = await fetch('/api/chat/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            sessionId,
            content,
            inputType,
            mode: config.aiMode,
            module,
          }),
          signal: abortController.current.signal,
        });

        if (!response.ok) {
          const errorData = await response.json();
          // Propagate detailed message from backend (crucial for index creation errors)
          const detailedError =
            errorData.message ||
            (typeof errorData.error === 'string'
              ? errorData.error
              : JSON.stringify(errorData.error));
          throw new Error(detailedError || 'Failed to send message');
        }

        const data = await response.json();

        // Reemplazar mensaje temporal y añadir respuesta
        setState(prev => ({
          ...prev,
          status: 'ready',
          messages: [
            ...prev.messages.filter(m => m.id !== tempUserMessage.id),
            data.userMessage,
            data.assistantMessage,
          ],
          error: null,
        }));

        console.log('[useChat] Message sent, response received');
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          console.log('[useChat] Request aborted');
          return;
        }

        const errorMessage =
          error instanceof Error ? error.message : 'Error sending message';

        // Mantener mensaje del usuario pero mostrar error
        setState(prev => ({
          ...prev,
          status: 'error',
          error: errorMessage,
        }));
      }
    },
    [userId, state.currentSession?.id, config.aiMode, module, createSession]
  );

  // ============================================
  // CONFIGURACIÓN
  // ============================================

  const setAIMode = useCallback((mode: AIMode) => {
    setConfig(prev => ({ ...prev, aiMode: mode }));
  }, []);

  const setAutoPlayVoice = useCallback((enabled: boolean) => {
    setConfig(prev => ({ ...prev, autoPlayVoice: enabled }));
  }, []);

  const setContinuousMode = useCallback((enabled: boolean) => {
    setConfig(prev => ({ ...prev, continuousMode: enabled }));
  }, []);

  const setDarkMode = useCallback((enabled: boolean) => {
    setConfig(prev => ({ ...prev, darkMode: enabled }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null, status: 'ready' }));
  }, []);

  // ============================================
  // INICIALIZACIÓN
  // ============================================

  useEffect(() => {
    if (!userId || isInitialized.current) return;

    isInitialized.current = true;

    const initialize = async () => {
      await loadSessions();

      if (autoCreateSession) {
        await createSession();
      }
    };

    initialize();

    // Cleanup
    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, [userId, autoCreateSession, loadSessions, createSession]);

  // ============================================
  // RETURN
  // ============================================

  return {
    state,
    config,
    sessions,
    currentSession: state.currentSession,
    loadSessions,
    selectSession,
    createSession,
    deleteSession,
    messages: state.messages,
    sendMessage,
    setAIMode,
    setAutoPlayVoice,
    setContinuousMode,
    setDarkMode,
    isLoading: state.status === 'connecting',
    isSending: state.status === 'sending',
    error: state.error,
    clearError,
  };
}
