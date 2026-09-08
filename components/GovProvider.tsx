'use client';
import { useEffect } from 'react';

export default function GovProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    import('@govbr-ds/webcomponents/loader').then((module) => {
      module.defineCustomElements();
    });
  }, []);

  return <>{children}</>;
}