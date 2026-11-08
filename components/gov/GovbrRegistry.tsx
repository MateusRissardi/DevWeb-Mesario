"use client";

import { useEffect, type ReactNode } from "react";
import { defineCustomElements } from "@govbr-ds/webcomponents/loader";

type GovbrRegistryProps = Readonly<{
  children: ReactNode;
}>;

export default function GovbrRegistry({
  children,
}: GovbrRegistryProps) {
  useEffect(() => {
    defineCustomElements();
  }, []);

  return children;
}