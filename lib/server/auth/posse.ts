import type { UsuarioPublico } from "./tipos";

/** Cartório e administrador atendem qualquer cadastro. */
export const ehEquipe = (usuario: UsuarioPublico) =>
  usuario.papel === "cartorio" || usuario.papel === "administrador";

/** O mesário só acessa o cadastro ligado à própria conta. */
export const ehDono = (usuario: UsuarioPublico, mesarioId: number) =>
  usuario.mesario_id !== null && usuario.mesario_id === mesarioId;
