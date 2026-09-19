"use client";

import AccessibilityBar from "@/components/layout/AccessibilityBar";

import { useSidebar } from "./SidebarContext";
import styles from "./AppHeader.module.css";

interface AppHeaderProps {
  userName?: string;
  userRole?: string;
}

const ZONA_ATUAL = "Eleições Gerais 2026 · 14ª Zona Eleitoral";

export default function AppHeader({
  //POR ENQUANTO FIXO (Só PARA TESTES)
  userName = "Artur",
  userRole = "Estagiário",
}: AppHeaderProps) {
  const { isOpen, toggle } = useSidebar();

  return (
    <header className={styles.header}>
      <div className={styles.topBar}>
        <AccessibilityBar />

        <button
          className={styles.infoButton}
          type="button"
          aria-label="Informações do sistema"
        >
          <i className="fas fa-info-circle" aria-hidden="true" />
        </button>
      </div>

      <div className={styles.mainBar}>
        <div className={styles.logoGroup}>
          <img
            className={styles.logoImage}
            src="/assets/tse-logo.svg"
            alt=""
            aria-hidden="true"
          />

          <span className={styles.divider} aria-hidden="true" />

          <span className={styles.systemLabel}>Gestão de Mesários</span>
        </div>

        <div className={styles.userGroup}>
          <i className={`fas fa-user-circle ${styles.avatarIcon}`} aria-hidden="true" />

          <span className={styles.userInfo}>
            <span className={styles.userGreeting}>Olá, {userName}</span>
            <span className={styles.userRole}>{userRole}</span>
          </span>

          <button
            className={styles.moreButton}
            type="button"
            aria-label="Mais opções"
          >
            <i className="fas fa-ellipsis-v" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className={styles.titleBar}>
        <div className={styles.titleGroup}>
          <button
            className={styles.menuToggle}
            type="button"
            onClick={toggle}
            aria-expanded={isOpen}
            aria-controls="cartorio-sidebar"
            aria-label={isOpen ? "Fechar menu lateral" : "Abrir menu lateral"}
          >
            <i className="fas fa-bars" aria-hidden="true" />
          </button>

          <div>
            <h1 className={styles.pageTitle}>Sistema de Gestão de Mesários</h1>
            <p className={styles.pageSubtitle}>
              Gerenciamento de informações para controle de mesários
            </p>
          </div>
        </div>

        <div className={styles.zoneChip} aria-label={`Contexto atual: ${ZONA_ATUAL}`}>
          <span>{ZONA_ATUAL}</span>
          <i className="fas fa-chevron-down" aria-hidden="true" />
        </div>
      </div>
    </header>
  );
}
