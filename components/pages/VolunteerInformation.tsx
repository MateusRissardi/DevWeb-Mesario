import Link from "next/link";

import styles from "./VolunteerInformation.module.css";

export default function VolunteerInformation() {
  return (
    <section
      className={styles.container}
      aria-labelledby="how-it-works-title"
    >
      <p className={styles.text}>
        Você poderá se candidatar ou descadastrar para o voluntariado dos
        trabalhos eleitorais via{" "}
        <strong>Portal do Mesário</strong>. Também poderá atualizar o número do
        seu telefone celular e e-mail de contato.
      </p>

      <p className={styles.text}>
        Para sua segurança, o acesso é feito através do seu{" "}
        <strong>e-Título</strong>. Basta usar seu <strong>CPF</strong> ou{" "}
        <strong>nº do título</strong> e o{" "}
        <strong>código de autenticação</strong>, gerado pelo aplicativo. Simples
        e seguro!
      </p>

      <Link
        className={styles.portalButton}
        href="/portal"
      >
        Portal do Mesário
      </Link>

      <h2
        className={styles.sectionTitle}
        id="how-it-works-title"
      >
        Como Funciona
      </h2>

      <p className={styles.text}>
        Para se voluntariar, basta clicar em{" "}
        <strong>Cadastro de Mesário Voluntário</strong>. O registro será
        realizado automaticamente após o preenchimento das informações de
        identificação.
      </p>

      <p className={styles.text}>
        Para descadastrar, clique em <strong>Entrar</strong> e depois{" "}
        <strong>Tirar Interesse</strong>. O registro será realizado
        automaticamente e a situação passará para Desistiu. Porém, ao se
        descadastrar, somente será permitido fazer um novo cadastro após 30
        dias.
      </p>

      <p className={styles.text}>
        Você também poderá informar seus{" "}
        <strong>contatos atuais</strong> (telefone/WhatsApp e e-mail) e excluir
        contatos desatualizados.
      </p>

      <p className={styles.text}>
        Lembre-se de manter o{" "}
        <strong>
          número do telefone/WhatsApp e e-mails sempre atualizados
        </strong>{" "}
        para que o Cartório Eleitoral possa entrar em contato com você.
      </p>
    </section>
  );
}