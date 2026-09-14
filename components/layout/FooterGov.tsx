import styles from "./FooterGov.module.css";

const footerLinks = [
  {
    label: "Guia de Serviços",
    href: "https://www.tse.jus.br/servicos-eleitorais",
  },
  {
    label: "Glossário Eleitoral",
    href: "https://www.tse.jus.br/servicos-eleitorais/glossario",
  },
  {
    label: "Guia de Recolhimento da União (GRU)",
    href: "https://www.tse.jus.br/servicos-judiciais/mais-servicos/guia-de-recolhimento-da-uniao-gru",
  },
  {
    label: "Situação dos Sistemas",
    href: "https://www.tse.jus.br/",
  },
  {
    label: "Meu Espaço",
    href: "https://www.tse.jus.br/",
  },
];

const socialLinks = [
  {
    label: "Facebook do TSE",
    href: "https://www.facebook.com/TSEJus",
    icon: "facebook.svg",
  },
  {
    label: "TSE no X",
    href: "https://x.com/TSEjusbr",
    icon: "x.svg",
  },
  {
    label: "Instagram do TSE",
    href: "https://www.instagram.com/tsejus/",
    icon: "instagram.svg",
  },
  {
    label: "TikTok do TSE",
    href: "https://www.tiktok.com/@tsejus",
    icon: "tiktok.svg",
  },
  {
    label: "LinkedIn do TSE",
    href: "https://www.linkedin.com/company/tsejus/",
    icon: "linkedin.svg",
  },
  {
    label: "Kwai do TSE",
    href: "https://www.kwai.com/@tsejus",
    icon: "kwai.svg",
  },
];

type FooterIconProps = Readonly<{
  name: string;
}>;

function FooterIcon({ name }: FooterIconProps) {
  return (
    <img
      className={styles.icon}
      src={`/assets/icons/footer/${name}`}
      alt=""
      aria-hidden="true"
    />
  );
}

export default function FooterGov() {
  return (
    <footer className={styles.footer}>
      <section className={styles.navigation}>
        <a
          className={styles.logoLink}
          href="https://www.tse.jus.br/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Acessar o portal do Tribunal Superior Eleitoral"
        >
          <img
            className={styles.logo}
            src="/assets/tse-logo-white.svg"
            alt="Tribunal Superior Eleitoral"
          />
        </a>

        <nav aria-label="Links institucionais do TSE">
          <ul className={styles.linkList}>
            {footerLinks.map((link) => (
              <li key={link.label}>
                <a
                  className={styles.link}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </section>

      <section
        className={styles.information}
        aria-label="Informações de atendimento do TSE"
      >
        <address className={styles.address}>
          <p>
            Setor de Administração Federal Sul <strong>(SAFS)</strong>
          </p>

          <p>
            <strong>
              Quadra 7, Lotes 1/2, Brasília/DF - 70095-901
            </strong>
          </p>

          <p>
            <strong>Telefone: (61) 3030-7000</strong>
          </p>
        </address>

        <hr className={styles.divider} />

        <div className={styles.service}>
          <p>
            Funcionamento dos protocolos{" "}
            <strong>administrativos e judiciários:</strong> segunda a sexta,
            das 11h às 19h.
          </p>

          <p>
            <strong>Horário de funcionamento</strong> de outros serviços e mais
            informações.
          </p>
        </div>

        <nav
          className={styles.socialNavigation}
          aria-label="Redes sociais do TSE"
        >
          <div className={styles.socialList}>
            {socialLinks.slice(0, 3).map((social) => (
              <a
                className={styles.socialButton}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                key={social.label}
              >
                <FooterIcon name={social.icon} />
              </a>
            ))}

            <button
              className={styles.socialButton}
              type="button"
              aria-label="Mostrar outras redes sociais"
            >
              <FooterIcon name="more.svg" />
            </button>

            {socialLinks.slice(3).map((social) => (
              <a
                className={styles.socialButton}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                key={social.label}
              >
                <FooterIcon name={social.icon} />
              </a>
            ))}
          </div>
        </nav>

        <div
          className={styles.actions}
          aria-label="Serviços institucionais"
        >
          <a
            className={styles.actionButton}
            href="https://www.tse.jus.br/servicos-eleitorais/servicos/ouvidoria-tse"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FooterIcon name="headphone.svg" />
            <span>Ouvidoria</span>
          </a>

          <a
            className={styles.actionButton}
            href="https://www.tse.jus.br/transparencia-e-prestacao-de-contas/gestao-da-informacao/tratamento-de-dados-pessoais"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FooterIcon name="medal.svg" />
            <span>Termos de uso e privacidade</span>
          </a>

          <button
            className={styles.actionButton}
            type="button"
          >
            <FooterIcon name="settings.svg" />
            <span>Configurações de cookies</span>
          </button>

          <button
            className={styles.actionButton}
            type="button"
          >
            <FooterIcon name="feedback.svg" />
            <span>Como foi sua navegação?</span>
          </button>
        </div>
      </section>

      <section
        className={styles.securityNotice}
        aria-label="Aviso de segurança"
      >
        <p className={styles.noticeText}>
          O Tribunal Superior Eleitoral{" "}
          <strong>não envia e-mails</strong> a eleitores para comunicar
          cancelamentos de título eleitoral.
        </p>

        <a
          className={styles.siteMapButton}
          href="https://www.tse.jus.br/@@sitemap"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FooterIcon name="sitemap.svg" />
          <span>Mapa do Site</span>
        </a>
      </section>
    </footer>
  );
}