import AppHeader from '@/components/cartorio/AppHeader';
import Sidebar from '@/components/cartorio/Sidebar';
import { SidebarProvider } from '@/components/cartorio/SidebarContext';

import styles from './layout.module.css';

export default function CartorioLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>          {/* <- precisa envolver TUDO que usa useSidebar */}
      <div className={styles.shell}>
        <AppHeader />           {/* usa useSidebar() */}
        <div className={styles.body}>
          <Sidebar />           {/* usa useSidebar() */}
          <main className={styles.content}>{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}