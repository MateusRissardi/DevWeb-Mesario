"use client";

import { usePathname } from "next/navigation";

import SidebarNavItem from "./SidebarNavItem";
import { sidebarNavItems } from "./sidebarConfig";
import styles from "./SidebarModule.module.css";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar} aria-label="Menu do cartório">
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
