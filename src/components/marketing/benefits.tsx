'use client';

import { useLanguage } from '@/components/marketing/language-context';
import { Card, CardContent } from '@/components/ui/card';
import {
  DollarSign,
  FileStack,
  Globe,
  GraduationCap,
  ShieldCheck,
  Zap,
} from 'lucide-react';

const icons = [DollarSign, FileStack, GraduationCap, ShieldCheck, Zap, Globe];

export function Benefits() {
  const { t } = useLanguage();

  return (
    <section
      id="benefits"
      className="relative py-20 lg:py-28 bg-white overflow-hidden"
    >
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2" />
      <div className="absolute top-1/2 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            {t.benefits.title}
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto text-pretty">
            {t.benefits.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {t.benefits.items.map((item, index) => {
            const Icon = icons[index];
            return (
              <Card
                key={index}
                className="border-2 border-slate-50 bg-slate-50/50 hover:bg-white hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 group group"
              >
                <CardContent className="p-8">
                  <div className="w-14 h-14 rounded-xl bg-white border border-slate-100 text-primary flex items-center justify-center mb-6 shadow-sm transition-all group-hover:scale-110 group-hover:bg-primary group-hover:text-white">
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
