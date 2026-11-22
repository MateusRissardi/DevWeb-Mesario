import nodemailer from "nodemailer";

export interface Mensagem {
  para: string;
  assunto: string;
  texto: string;
}

/** O envio de e-mail está configurado neste ambiente? */
export function emailConfigurado(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_FROM);
}

/**
 * Envia um e-mail em texto simples por SMTP. Lança erro se o SMTP não estiver
 * configurado ou se o servidor recusar. Nunca registra o conteúdo da mensagem.
 */
export async function enviarEmail({ para, assunto, texto }: Mensagem) {
  if (!emailConfigurado()) {
    throw new Error("SMTP não configurado");
  }

  const porta = Number(process.env.SMTP_PORT) || 587;
  const usuario = process.env.SMTP_USER;

  const transporte = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: porta,
    secure: process.env.SMTP_SECURE === "true" || porta === 465,
    auth: usuario ? { user: usuario, pass: process.env.SMTP_PASS ?? "" } : undefined,
  });

  await transporte.sendMail({
    from: process.env.SMTP_FROM,
    to: para,
    subject: assunto,
    text: texto,
  });
}
