import Link from "next/link";

import { ChevronIcon } from "./SidebarIcons";
import type { SidebarNavItem as SidebarNavItemData } from "./sidebarConfig";
import styles from "./SidebarModule.module.css";

interface SidebarNavItemProps {
  item: SidebarNavItemData;
  isActive: boolean;
}

export default function SidebarNavItem({ item, isActive }: SidebarNavItemProps) {
  const Icon = item.icon;

  return (
    <li className={styles.item}>
      <Link
        href={item.href}
        className={`${styles.link} ${isActive ? styles.linkActive : ""}`}
        aria-current={isActive ? "page" : undefined}
      >
        <Icon className={styles.icon} />

        <span className={styles.label}>{item.label}</span>

        {item.badge !== undefined && (
          <span className={styles.badge} aria-label={`${item.badge} pendências`}>
            {item.badge}
          </span>
        )}

        <ChevronIcon className={styles.chevron} />
      </Link>
    </li>
  );
}
