'use client';

import { useEffect, type ReactNode } from 'react';
import { defineCustomElements } from '@govbr-ds/webcomponents/loader';

export default function GovbrRegistry({
  children,
}: {
  children: ReactNode;
}) {
  useEffect(() => {
    defineCustomElements(window);
  }, []);

  return <>{children}</>;
}