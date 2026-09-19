import type { CSSProperties } from "react";

import Link from "next/link";

import type {
  SidebarNavItem as SidebarNavItemData,
} from "./sidebarConfig";

import styles from "./SidebarModule.module.css";

interface SidebarNavItemProps {
  item: SidebarNavItemData;
  isActive: boolean;
}

const chevronStyle = {
  "--sidebar-icon":
    "url(/assets/icons/sidebar/chevron.svg)",
} as CSSProperties;

export default function SidebarNavItem({
  item,
  isActive,
}: SidebarNavItemProps) {
  const iconStyle = {
    "--sidebar-icon": `url(${item.iconSrc})`,
  } as CSSProperties;

  return (
    <li className={styles.item}>
      <Link
        href={item.href}
        className={`${styles.link} ${
          isActive ? styles.linkActive : ""
        }`}
        aria-current={isActive ? "page" : undefined}
      >
        <span
          className={styles.icon}
          style={iconStyle}
          aria-hidden="true"
        />

        <span className={styles.label}>
          {item.label}
        </span>

        {item.badge !== undefined && (
          <span
            className={styles.badge}
            aria-label={`${item.badge} pendências`}
          >
            {item.badge}
          </span>
        )}

        <span
          className={styles.chevron}
          style={chevronStyle}
          aria-hidden="true"
        />
      </Link>
    </li>
  );
}