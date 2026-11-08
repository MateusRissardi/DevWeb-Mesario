import type { Papel, UsuarioPublico } from "@/lib/server/auth/tipos";
import { conferirSenha, gerarHash } from "@/lib/server/auth/senha";
import { criarToken } from "@/lib/server/auth/token";
import {
  buscarMesarioId,
  buscarPorEmail,
  contarFalhasRecentes,
  inserirUsuario,
  limparFalhas,
  registrarFalha,
} from "@/lib/server/db/usuarios";
import type { CamposInvalidos } from "@/lib/server/http";
import type { CriarUsuarioEntrada } from "@/lib/server/validation/usuarios";

const JANELA_MINUTOS = 15;
const MAX_FALHAS_POR_EMAIL = 5;
const MAX_FALHAS_POR_IP = 20;

export interface Falha {
  ok: false;
  status: number;
  erro: string;
  campos?: CamposInvalidos;
  retryAfterSegundos?: number;
}

/**
 * Cria uma conta. Sem token, só nasce conta de mesário. Com CPF e título ela já
 * nasce ligada ao cadastro existente; sem eles, fica sem cadastro e é ligada
 * quando a pessoa concluir o cadastro de voluntário. Outros papéis exigem
 * um administrador.
 */
export async function criarConta(
  entrada: CriarUsuarioEntrada,
  chamador: UsuarioPublico | null,
): Promise<{ ok: true; usuario: UsuarioPublico } | Falha> {
  const papel: Papel = entrada.papel ?? "mesario";

  if (papel !== "mesario") {
    if (!chamador) {
      return {
        ok: false,
        status: 401,
        erro: "Autenticação necessária para criar este tipo de conta",
      };
    }
    if (chamador.papel !== "administrador") {
      return {
        ok: false,
        status: 403,
        erro: "Sem permissão para criar este tipo de conta",
      };
    }
  }

  let mesarioId: number | null = null;
  const { cpf, titulo_eleitor: titulo } = entrada;

  if (papel === "mesario" && (cpf || titulo)) {
    const campos: CamposInvalidos = {};
    if (!cpf) campos.cpf = "Informe o CPF";
    if (!titulo) campos.titulo_eleitor = "Informe o título de eleitor";
    if (Object.keys(campos).length > 0 || !cpf || !titulo) {
      return { ok: false, status: 400, erro: "Dados inválidos", campos };
    }

    mesarioId = await buscarMesarioId(cpf, titulo);
    if (mesarioId === null) {
      return {
        ok: false,
        status: 400,
        erro: "Dados inválidos",
        campos: { cadastro: "Nenhum cadastro encontrado com esses dados" },
      };
    }
  }

  const senhaHash = await gerarHash(entrada.senha);

  try {
    const usuario = await inserirUsuario({
      email: entrada.email,
      senhaHash,
      papel,
      mesarioId,
    });
    return { ok: true, usuario };
  } catch (erro) {
    const { code, constraint } = erro as { code?: string; constraint?: string };
    if (code === "23505") {
      return {
        ok: false,
        status: 409,
        erro:
          constraint === "usuarios_mesario_id_key"
            ? "Já existe uma conta para este cadastro"
            : "E-mail já cadastrado",
      };
    }
    throw erro;
  }
}

/** Confere e-mail e senha. A mensagem de falha é a mesma para e-mail inexistente e senha errada. */
export async function autenticar(
  email: string,
  senha: string,
  ip: string | null,
): Promise<
  | {
      ok: true;
      token: string;
      expiraEm: string;
      usuario: UsuarioPublico;
    }
  | Falha
> {
  const falhas = await contarFalhasRecentes(email, ip, JANELA_MINUTOS);
  if (
    falhas.porEmail >= MAX_FALHAS_POR_EMAIL ||
    falhas.porIp >= MAX_FALHAS_POR_IP
  ) {
    return {
      ok: false,
      status: 429,
      erro: "Muitas tentativas. Tente novamente mais tarde",
      retryAfterSegundos: JANELA_MINUTOS * 60,
    };
  }

  const registro = await buscarPorEmail(email);
  const confere = await conferirSenha(senha, registro?.senha_hash);

  if (!registro || !confere) {
    await registrarFalha(email, ip);
    return { ok: false, status: 401, erro: "E-mail ou senha inválidos" };
  }

  await limparFalhas(email);
  const { token, expiraEm } = await criarToken(registro.id);
  const { senha_hash: _descartado, ...usuario } = registro;
  void _descartado;

  return { ok: true, token, expiraEm, usuario };
}
