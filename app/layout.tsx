import '@govbr-ds/core/dist/core.css';
import GovProvider from '@/components/GovProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        {/* Fontes necessárias para o Design System Gov.br */}
        <link href="https://fonts.cdnfonts.com/css/rawline" rel="stylesheet" />
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" rel="stylesheet" />
      </head>
      <body>
        <GovProvider>
          {children}
        </GovProvider>
      </body>
    </html>
  );
}