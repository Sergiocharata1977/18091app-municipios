'use client';

import {
  DonCandidoAvatar,
  DonCandidoMood,
} from '@/components/ui/DonCandidoAvatar';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';

const TOUR_KEY = 'tour_don_candido_v1_completado';

interface TourStep {
  element: string;
  mood: DonCandidoMood;
  title: string;
  content: React.ReactNode;
  side: 'top' | 'bottom' | 'left' | 'right';
  align: 'start' | 'center' | 'end';
}

export const DonCandidoTour = () => {
  const driverObj = useRef<ReturnType<typeof driver> | null>(null);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem(TOUR_KEY);
    if (hasSeenTour) return;

    // Flujo lógico: Planificación → Revisión → Organización → Objetivos → RRHH
    const tourSteps: TourStep[] = [
      {
        element: '#tour-start',
        mood: 'saludo',
        title: '👋 ¡Hola! Soy Don Cándido',
        content: (
          <>
            <p>
              Soy tu <strong>asistente de IA</strong> para gestionar la calidad
              de tu organización.
            </p>
            <p className="mt-2 text-emerald-600 font-medium">
              Te voy a guiar por los primeros pasos fundamentales.
            </p>
          </>
        ),
        side: 'bottom',
        align: 'center',
      },
      {
        element: '#tab-noticias',
        mood: 'explicando',
        title: '📰 Centro de Noticias',
        content: (
          <>
            <p>
              Aquí verás las <strong>noticias y comunicaciones</strong> de tu
              organización.
            </p>
            <p className="mt-2 text-slate-500 italic">
              Es tu tablero de novedades diarias.
            </p>
          </>
        ),
        side: 'bottom',
        align: 'start',
      },
      {
        element: '#tab-madurez',
        mood: 'señalando',
        title: '📊 1. PLANIFICACIÓN - Madurez Organizacional',
        content: (
          <>
            <p className="font-semibold text-emerald-700">
              Este es el PRIMER paso fundamental.
            </p>
            <p className="mt-2">
              Aquí evaluamos la <strong>"salud"</strong> de tu organización:
            </p>
            <ul className="mt-2 text-sm list-disc list-inside space-y-1">
              <li>Definición de la organización</li>
              <li>Objetivos estratégicos</li>
              <li>Recursos disponibles</li>
            </ul>
          </>
        ),
        side: 'bottom',
        align: 'center',
      },
      {
        element: '#tab-cumplimiento',
        mood: 'explicando',
        title: '✅ 2. REVISIÓN - Cumplimiento',
        content: (
          <>
            <p>
              Después de planificar, <strong>revisamos el cumplimiento</strong>.
            </p>
            <p className="mt-2">Aquí verificamos:</p>
            <ul className="mt-2 text-sm list-disc list-inside space-y-1">
              <li>Estado de procesos documentados</li>
              <li>Indicadores de gestión</li>
              <li>Acciones correctivas pendientes</li>
            </ul>
          </>
        ),
        side: 'bottom',
        align: 'center',
      },
      {
        element: '#tab-gaps',
        mood: 'señalando',
        title: '⚠️ 3. ANÁLISIS - Brechas (Gaps)',
        content: (
          <>
            <p>
              Identificamos las <strong>brechas</strong> entre donde estás y
              donde deberías estar.
            </p>
            <p className="mt-2 text-slate-500 italic border-l-2 border-amber-500 pl-2">
              "No puedes mejorar lo que no mides."
            </p>
          </>
        ),
        side: 'bottom',
        align: 'center',
      },
      {
        element: '#tab-mcp',
        mood: 'saludo',
        title: '🤖 4. AUTOMATIZACIÓN - Mini Copilot',
        content: (
          <>
            <p>
              ¡Aquí es donde brillo! El <strong>MCP</strong> me permite:
            </p>
            <ul className="mt-2 text-sm list-disc list-inside space-y-1">
              <li>Automatizar tareas repetitivas</li>
              <li>Controlar sistemas externos</li>
              <li>Generar reportes automáticos</li>
            </ul>
            <p className="mt-2 text-emerald-600 font-medium">¡Déjamelo a mí!</p>
          </>
        ),
        side: 'bottom',
        align: 'center',
      },
      {
        element: '#tour-start',
        mood: 'saludo',
        title: '🚀 ¡Listo para comenzar!',
        content: (
          <>
            <p>Ahora conoces las herramientas principales.</p>
            <p className="mt-2">
              <strong>Mi recomendación:</strong>
            </p>
            <ol className="mt-2 text-sm list-decimal list-inside space-y-1">
              <li>
                Comienza por <strong>Madurez</strong> para definir tu
                organización
              </li>
              <li>
                Establece tus <strong>objetivos</strong>
              </li>
              <li>
                Registra tus <strong>recursos humanos</strong>
              </li>
            </ol>
            <p className="mt-3 text-emerald-600 font-medium">
              ¿Tienes preguntas? Usa el botón de ayuda (?) para repetir este
              tour.
            </p>
          </>
        ),
        side: 'bottom',
        align: 'center',
      },
    ];

    const driverConfig = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      doneBtnText: '¡Comenzar!',
      nextBtnText: 'Siguiente →',
      prevBtnText: '← Atrás',
      progressText: '{{current}} de {{total}}',
      onDestroyed: () => {
        localStorage.setItem(TOUR_KEY, 'true');
      },
      steps: tourSteps.map(step => ({
        element: step.element,
        popover: {
          title: step.title,
          description: '<div id="driver-popover-content-placeholder"></div>',
          side: step.side,
          align: step.align,
        },
      })),
      onHighlightStarted: (_element, step) => {
        requestAnimationFrame(() => {
          const popoverWrapper = document.querySelector('.driver-popover');
          if (!popoverWrapper) return;

          const descriptionContainer = popoverWrapper.querySelector(
            '#driver-popover-content-placeholder'
          );

          if (descriptionContainer) {
            const stepData = tourSteps.find(
              s => s.title === step.popover?.title
            );

            if (stepData) {
              descriptionContainer.innerHTML = '';

              const root = createRoot(descriptionContainer);
              root.render(
                <div className="flex flex-col gap-2 p-1">
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 shrink-0 -ml-2 -mt-2">
                      <DonCandidoAvatar mood={stepData.mood} />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-slate-600 space-y-1">
                        {stepData.content}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
          }
        });
      },
    });

    driverObj.current = driverConfig;

    const timer = setTimeout(() => {
      driverObj.current?.drive();
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return null;
};
