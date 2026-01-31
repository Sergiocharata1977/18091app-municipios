'use client';

import { motion } from 'framer-motion';

interface HealthGaugeProps {
  score: number; // 0-100
  trend?: number; // diferencia vs mes anterior
}

export function HealthGauge({ score, trend = 0 }: HealthGaugeProps) {
  // Configuración de colores según score
  const getColor = (s: number) => {
    if (s >= 80) return '#22c55e'; // Green-500
    if (s >= 50) return '#f59e0b'; // Amber-500
    return '#ef4444'; // Red-500
  };

  const color = getColor(score);

  // Cálculo del arco (semicírculo)
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * (circumference / 2); // Solo usamos la mitad superior

  return (
    <div className="relative flex flex-col items-center justify-center p-6">
      <div className="relative w-64 h-32 overflow-hidden">
        <svg
          className="w-full h-full transform rotate-180"
          viewBox="0 0 200 100"
          style={{ transform: 'rotate(180deg)', overflow: 'visible' }}
        >
          {/* Fondo del arco */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#1e293b" // slate-800
            strokeWidth="12"
            strokeLinecap="round"
          />

          {/* Arco de progreso */}
          <motion.path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference / 2} // Semicírculo completo
            initial={{ strokeDashoffset: circumference / 2 }}
            animate={{
              strokeDashoffset:
                circumference / 2 - (score / 100) * (circumference / 2),
            }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            style={{
              filter: `drop-shadow(0 0 8px ${color}80)`, // Glow effect
            }}
          />
        </svg>

        {/* Texto Central */}
        <div className="absolute bottom-0 left-0 right-0 text-center transform translate-y-2">
          {' '}
          {/* Ajuste posición */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold tracking-tighter text-white"
          >
            {score}%
          </motion.div>
          <div className="text-sm font-medium text-slate-400 mt-1">
            System Health
          </div>
        </div>
      </div>

      {/* Tendencia */}
      <div
        className={`mt-6 text-sm flex items-center gap-1 ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}
      >
        <span>{trend >= 0 ? '↗' : '↘'}</span>
        <span>{Math.abs(trend)}% vs last month</span>
      </div>
    </div>
  );
}
