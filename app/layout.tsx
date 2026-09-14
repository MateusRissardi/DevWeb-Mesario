import type { Metadata } from "next";
import GovbrRegistry from "@/components/gov/GovbrRegistry";
import "@govbr-ds/core/dist/core.min.css";

export const metadata: Metadata = {
  title: "Portal do Mesário",
  description: "Portal de serviços para mesários voluntários",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <GovbrRegistry>{children}</GovbrRegistry>
      </body>
    </html>
  );
}