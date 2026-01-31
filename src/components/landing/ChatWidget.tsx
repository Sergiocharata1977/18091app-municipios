// ChatWidget - Floating Action Button para abrir el chat en landing page
'use client';

import { DonCandidoAvatar } from '@/components/ui/DonCandidoAvatar';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { ChatWindow } from './ChatWindow';

interface ChatWidgetProps {
  position?: 'bottom-right' | 'bottom-left';
  className?: string;
}

export function ChatWidget({
  position = 'bottom-right',
  className,
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
  };

  return (
    <>
      {/* FAB Button - MÁS GRANDE que el sistema interno */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed z-40',
          positionClasses[position],
          'w-40 h-40 rounded-full', // 160px (más grande que 128px del sistema)
          'bg-transparent',
          'hover:bg-white/5',
          'border-2 border-emerald-500/20',
          'hover:border-emerald-500/40',
          'shadow-lg hover:shadow-xl shadow-emerald-500/25',
          'flex items-center justify-center',
          'transition-all duration-300 hover:scale-110',
          'group overflow-visible',
          isOpen && 'hidden',
          className
        )}
        title="Abrir Don Cándido IA"
        aria-label="Abrir asistente IA"
      >
        {/* Lottie Animation - 140px (35 * 4) */}
        <div className="w-35 h-35">
          <DonCandidoAvatar mood="chatbot" className="w-full h-full" />
        </div>

        {/* Pulse animation */}
        <span className="absolute inset-0 rounded-full bg-emerald-400/30 animate-ping opacity-25" />

        {/* Tooltip */}
        <span className="absolute right-full mr-3 px-3 py-1.5 rounded-lg bg-gray-900 text-white text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          ¿Preguntas sobre ISO 9001?
        </span>

        {/* Badge de "Nuevo" o notificación */}
        <span className="absolute -top-2 -right-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg animate-bounce">
          Nuevo
        </span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <ChatWindow onClose={() => setIsOpen(false)} position={position} />
      )}
    </>
  );
}
