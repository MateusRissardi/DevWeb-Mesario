import type { ReactNode } from 'react';

import GuardaAcesso from '@/components/auth/GuardaAcesso';
import AppHeader from '@/components/cartorio/AppHeader';
import Sidebar from '@/components/cartorio/Sidebar';
import { SidebarProvider } from '@/components/cartorio/SidebarContext';

import styles from './layout.module.css';

export default function CartorioLayout({ children }: { children: ReactNode }) {
  return (
    <GuardaAcesso papeis={['cartorio', 'administrador']}>
      <SidebarProvider>          {/* <- precisa envolver TUDO que usa useSidebar */}
        <div className={styles.shell}>
          <AppHeader />           {/* usa useSidebar() */}
          <div className={styles.body}>
            <Sidebar />           {/* usa useSidebar() */}
            <main className={styles.content}>{children}</main>
          </div>
        </div>
      </SidebarProvider>
    </GuardaAcesso>
  );
}