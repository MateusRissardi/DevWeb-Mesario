'use client';

import { useEffect } from 'react';
import { defineCustomElements } from '@govbr-ds/webcomponents/loader';

export default function GovbrRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    defineCustomElements(window);
  }, []);

  return <>{children}</>;
}