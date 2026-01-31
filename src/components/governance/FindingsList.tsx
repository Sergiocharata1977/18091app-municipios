'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowRight, Clock } from 'lucide-react';

export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface Finding {
  id: string;
  code: string;
  title: string;
  severity: Severity;
  evidence: string;
  daysOpen: number;
}

interface FindingsListProps {
  findings: Finding[];
  onFix: (id: string) => void;
}

export function FindingsList({ findings, onFix }: FindingsListProps) {
  const getSeverityColor = (s: Severity) => {
    switch (s) {
      case 'CRITICAL':
        return 'text-red-500 border-red-500/20 bg-red-500/10';
      case 'HIGH':
        return 'text-orange-500 border-orange-500/20 bg-orange-500/10';
      case 'MEDIUM':
        return 'text-yellow-500 border-yellow-500/20 bg-yellow-500/10';
      case 'LOW':
        return 'text-blue-500 border-blue-500/20 bg-blue-500/10';
    }
  };

  return (
    <div className="space-y-3">
      {findings.map((finding, index) => (
        <motion.div
          key={finding.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="p-4 bg-slate-900/40 border-slate-800 hover:border-slate-700 transition-colors group">
            <div className="flex items-center justify-between gap-4">
              {/* Icon & Title */}
              <div className="flex items-center gap-4 flex-1">
                <div
                  className={`p-2 rounded-lg ${getSeverityColor(finding.severity)} bg-opacity-10`}
                >
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-slate-500">
                      {finding.code}
                    </span>
                    <Badge
                      variant="outline"
                      className={`${getSeverityColor(finding.severity)} text-[10px] uppercase`}
                    >
                      {finding.severity}
                    </Badge>
                  </div>
                  <h4 className="font-medium text-slate-200 group-hover:text-white transition-colors">
                    {finding.title}
                  </h4>
                </div>
              </div>

              {/* Evidence */}
              <div className="hidden md:block flex-1 border-l border-slate-800 pl-4">
                <p className="text-xs text-slate-500 uppercase font-semibold mb-1">
                  Evidence
                </p>
                <p className="text-sm text-slate-300 font-mono truncate">
                  {finding.evidence}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pl-4">
                <div className="bg-slate-800 text-slate-400 text-xs px-2 py-1 rounded hidden sm:flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {finding.daysOpen}d
                </div>
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                  onClick={() => onFix(finding.id)}
                >
                  Fix Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
