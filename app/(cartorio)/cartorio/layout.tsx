import AppHeader from '@/components/cartorio/AppHeader';
import Sidebar from '@/components/cartorio/Sidebar';

export default function CartorioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="app-shell">
      <AppHeader />

      <div className="app-body">
        <Sidebar />

        <main className="app-content">
          {children}
        </main>
      </div>
    </div>
  );
}