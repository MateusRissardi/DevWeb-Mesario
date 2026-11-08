export const PAPEIS = ["mesario", "cartorio", "administrador"] as const;

export type Papel = (typeof PAPEIS)[number];

/** Dados da conta que podem sair do servidor. Nunca inclui a senha nem o hash. */
export interface UsuarioPublico {
  id: number;
  email: string;
  papel: Papel;
  mesario_id: number | null;
  criado_em: Date;
}
