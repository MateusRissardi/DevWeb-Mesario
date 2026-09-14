"use client";

import { useEffect } from "react";
import { defineCustomElements } from "@govbr-ds/webcomponents/loader";

type GovbrRegistryProps = Readonly<{
  children: React.ReactNode;
}>;

export default function GovbrRegistry({
  children,
}: GovbrRegistryProps) {
  useEffect(() => {
    defineCustomElements();
  }, []);

  return children;
}