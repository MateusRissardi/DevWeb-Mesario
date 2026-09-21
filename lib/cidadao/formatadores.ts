export const somenteDigitos = (valor: string) => valor.replace(/\D/g, "");

/** Máscara progressiva: CPF (até 11 dígitos) ou nº do título (12 dígitos). */
export function formatarIdentificador(valor: string) {
  const digitos = somenteDigitos(valor).slice(0, 12);

  if (digitos.length <= 11) {
    return digitos
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }

  return digitos.replace(/(\d{4})(\d{4})(\d{4})/, "$1 $2 $3");
}

export function formatarTelefone(valor: string) {
  const digitos = somenteDigitos(valor).slice(0, 11);
  const ddd = digitos.slice(0, 2);
  const numero = digitos.slice(2);

  if (!digitos) {
    return "";
  }

  if (!numero) {
    return `(${ddd}`;
  }

  const corte = digitos.length > 10 ? 5 : 4;

  return numero.length > corte
    ? `(${ddd}) ${numero.slice(0, corte)}-${numero.slice(corte)}`
    : `(${ddd}) ${numero}`;
}

export const identificadorValido = (valor: string) =>
  [11, 12].includes(somenteDigitos(valor).length);

export const telefoneValido = (valor: string) =>
  [10, 11].includes(somenteDigitos(valor).length);

export const emailValido = (valor: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);

/** Nº do título de eleitor: 12 dígitos agrupados de 4 em 4. */
export const formatarTitulo = (valor: string) =>
  somenteDigitos(valor)
    .slice(0, 12)
    .replace(/(\d{4})(?=\d)/g, "$1 ");

export const tituloValido = (valor: string) => somenteDigitos(valor).length === 12;

/** Zona e seção eleitoral: só dígitos, até 4. */
export const formatarNumeroEleitoral = (valor: string) =>
  somenteDigitos(valor).slice(0, 4);

/** Máscara progressiva dd/mm/aaaa. */
export function formatarData(valor: string) {
  return somenteDigitos(valor)
    .slice(0, 8)
    .replace(/^(\d{2})(\d)/, "$1/$2")
    .replace(/^(\d{2}\/\d{2})(\d)/, "$1/$2");
}

/** Data dd/mm/aaaa que existe no calendário, de 1900 até hoje. */
export function dataNascimentoValida(valor: string) {
  const partes = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(valor);

  if (!partes) {
    return false;
  }

  const [dia, mes, ano] = [Number(partes[1]), Number(partes[2]), Number(partes[3])];
  const data = new Date(ano, mes - 1, dia);

  return (
    ano >= 1900 &&
    data.getFullYear() === ano &&
    data.getMonth() === mes - 1 &&
    data.getDate() === dia &&
    data <= new Date()
  );
}

/** "12" → "12ª Zona Eleitoral". */
export const descreverZona = (zona: string) =>
  `${Number(somenteDigitos(zona))}ª Zona Eleitoral`;

/** Oculta o título, exceto os 4 últimos dígitos: "XXXX XXXX 9012". */
export function mascararTitulo(titulo: string) {
  const digitos = somenteDigitos(titulo);

  return digitos.length === 12 ? `XXXX XXXX ${digitos.slice(-4)}` : "XXXX XXXX XXXX";
}
