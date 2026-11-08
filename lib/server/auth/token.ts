import { SignJWT, jwtVerify } from "jose";

const EXPIRACAO_SEGUNDOS = 60 * 60;
const EMISSOR = "portal-mesario";

function segredo(): Uint8Array {
  const valor = process.env.JWT_SECRET;
  if (!valor || valor.length < 32) {
    throw new Error("JWT_SECRET ausente ou com menos de 32 caracteres");
  }
  return new TextEncoder().encode(valor);
}

export async function criarToken(usuarioId: number) {
  const expiraEm = Math.floor(Date.now() / 1000) + EXPIRACAO_SEGUNDOS;
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(usuarioId))
    .setIssuer(EMISSOR)
    .setIssuedAt()
    .setExpirationTime(expiraEm)
    .sign(segredo());

  return { token, expiraEm: new Date(expiraEm * 1000).toISOString() };
}

/** Devolve o id do usuário se o token for válido e não tiver expirado; senão, null. */
export async function verificarToken(token: string): Promise<number | null> {
  const chave = segredo();

  try {
    const { payload } = await jwtVerify(token, chave, {
      algorithms: ["HS256"],
      issuer: EMISSOR,
    });
    const id = Number(payload.sub);
    return Number.isInteger(id) && id > 0 ? id : null;
  } catch {
    return null;
  }
}
