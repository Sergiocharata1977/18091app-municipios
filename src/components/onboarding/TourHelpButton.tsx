'use client';

import { Button } from '@/components/ui/button';
import { HelpCircle, RotateCcw } from 'lucide-react';
import { useState } from 'react';

const TOUR_KEY = 'tour_don_candido_v1_completado';

interface TourHelpButtonProps {
  className?: string;
  variant?: 'icon' | 'full';
}

export const TourHelpButton = ({
  className,
  variant = 'icon',
}: TourHelpButtonProps) => {
  const [isRestarting, setIsRestarting] = useState(false);

  const handleRestartTour = () => {
    setIsRestarting(true);
    // Remove the tour completion flag
    localStorage.removeItem(TOUR_KEY);
    // Reload the page to restart the tour
    window.location.reload();
  };

  if (variant === 'full') {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleRestartTour}
        disabled={isRestarting}
        className={className}
      >
        <RotateCcw
          className={`h-4 w-4 mr-2 ${isRestarting ? 'animate-spin' : ''}`}
        />
        {isRestarting ? 'Reiniciando...' : 'Comenzar Tour Guiado'}
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleRestartTour}
      disabled={isRestarting}
      className={`h-8 w-8 ${className}`}
      title="Comenzar tour guiado con Don Cándido"
    >
      <HelpCircle
        className={`h-5 w-5 text-emerald-600 ${isRestarting ? 'animate-pulse' : ''}`}
      />
      <span className="sr-only">Comenzar tour guiado</span>
    </Button>
  );
};
