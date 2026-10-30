"use client";

import { useState } from "react";
import styles from "./page.module.css";

type HealthResponse = {
  status: "ok";
  service: string;
  timestamp: string;
};

function isHealthResponse(value: unknown): value is HealthResponse {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const response = value as Record<string, unknown>;

  return (
    response.status === "ok" &&
    typeof response.service === "string" &&
    typeof response.timestamp === "string"
  );
}

export default function TesteConexaoPage() {
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function checkConnection() {
    setIsChecking(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch("/api/health", { cache: "no-store" });

      if (!response.ok) {
        throw new Error(`O servidor respondeu com HTTP ${response.status}.`);
      }

      const payload: unknown = await response.json();

      if (!isHealthResponse(payload)) {
        throw new Error("O servidor retornou uma resposta inesperada.");
      }

      setResult(payload);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Não foi possível conectar ao servidor.",
      );
    } finally {
      setIsChecking(false);
    }
  }

  return (
    <main className={styles.main}>
      <section className={styles.card} aria-labelledby="page-title">
        <p className={styles.eyebrow}>Diagnóstico</p>
        <h1 id="page-title">Teste de conexão</h1>
        <p>
          Esta verificação envia uma requisição do navegador para o servidor do
          Portal do Mesário.
        </p>

        <button
          className={styles.button}
          type="button"
          onClick={checkConnection}
          disabled={isChecking}
        >
          {isChecking ? "Verificando..." : "Verificar conexão"}
        </button>

        {result && (
          <div className={styles.success} role="status" aria-live="polite">
            <strong>Conexão estabelecida.</strong>
            <span>Servidor: {result.service}</span>
            <span>
              Resposta recebida em{" "}
              {new Date(result.timestamp).toLocaleString("pt-BR")}
            </span>
          </div>
        )}

        {error && (
          <p className={styles.error} role="alert">
            Falha na conexão: {error}
          </p>
        )}
      </section>
    </main>
  );
}
