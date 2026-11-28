"use client";

import { useState } from "react";

import { BrButton } from "@govbr-ds/webcomponents-react";

import CadastrarVoluntarioModal from "./CadastrarVoluntarioModal";

/** Abre o modal de cadastro e avisa a página (evento) para atualizar as listas. */
export default function NovoVoluntarioBotao({
  densidade,
  onConcluido,
}: Readonly<{ densidade?: "small"; onConcluido?: () => void }>) {
  const [aberto, setAberto] = useState(false);
  return (
    <>
      <BrButton emphasis="primary" density={densidade} type="button" onClick={() => setAberto(true)}>
        + Cadastrar voluntário
      </BrButton>
      {aberto && (
        <CadastrarVoluntarioModal
          onConcluido={() => onConcluido?.()}
          onFechar={() => setAberto(false)}
        />
      )}
    </>
  );
}
