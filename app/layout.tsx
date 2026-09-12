import GovbrRegistry from '../components/GovbrRegistry.tsx';
import '@govbr-ds/core/dist/core.min.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <GovbrRegistry>
          {children}
        </GovbrRegistry>
      </body>
    </html>
  );
}