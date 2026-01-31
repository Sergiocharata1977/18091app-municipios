'use client';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function MiSGCPage() {
  useEffect(() => {
    redirect('/mi-sgc/madurez');
  }, []);

  return null;
}
