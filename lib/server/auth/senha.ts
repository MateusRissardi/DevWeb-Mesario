import bcrypt from "bcryptjs";

// Custo do bcrypt (10 ou mais)
const CUSTO = 12;

const HASH_FICTICIO =
  "$2b$12$uyKo2RyCu6ZOR/oxj2M3IOkcYmscLMK.gCclwi4gPlJWMB.jgLTMq";

export function gerarHash(senha: string): Promise<string> {
  return bcrypt.hash(senha, CUSTO);
}

// Confere a senha com bcrypt.compare. Se não houver hash, compara com o fictício e devolve false.
export async function conferirSenha(
  senha: string,
  hash: string | null | undefined,
): Promise<boolean> {
  const confere = await bcrypt.compare(senha, hash ?? HASH_FICTICIO);
  return hash != null && confere;
}
