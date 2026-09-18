"use client";

import { usePathname } from "next/navigation";

import SidebarNavItem from "./SidebarNavItem";
import { sidebarNavItems } from "./sidebarConfig";
import { useSidebar } from "./SidebarContext";
import styles from "./SidebarModule.module.css";


export default function Sidebar() {
  const pathname = usePathname();
  const { isOpen } = useSidebar();

  return (
    <aside
      id="cartorio-sidebar"
      className={`${styles.sidebar} ${!isOpen ? styles.sidebarClosed : ""}`}
      aria-label="Menu do cartório"
      inert={!isOpen}
    >
      <nav aria-label="Navegação principal">
        <ul className={styles.list}>
          {sidebarNavItems.map((item) => {
            const isActive =
              item.href === "/cartorio"
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <SidebarNavItem key={item.id} item={item} isActive={isActive} />
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
