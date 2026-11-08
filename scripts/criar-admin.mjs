// Cria o primeiro administrador. Rode uma vez, com autorização:
//   node --env-file=.env.local scripts/criar-admin.mjs
// Variáveis lidas do ambiente: DATABASE_URL, ADMIN_EMAIL e ADMIN_SENHA.
// A senha nunca é impressa nem aceita por argumento de linha de comando.
import bcrypt from "bcryptjs";
import pg from "pg";

const { DATABASE_URL, ADMIN_EMAIL, ADMIN_SENHA } = process.env;

function falhar(mensagem) {
  console.error(mensagem);
  process.exit(1);
}

if (!DATABASE_URL || !ADMIN_EMAIL || !ADMIN_SENHA) {
  falhar("Defina DATABASE_URL, ADMIN_EMAIL e ADMIN_SENHA no ambiente.");
}

const email = ADMIN_EMAIL.trim().toLowerCase();
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
  falhar("ADMIN_EMAIL não é um e-mail válido.");
}

if (
  ADMIN_SENHA.length < 10 ||
  Buffer.byteLength(ADMIN_SENHA, "utf8") > 72 ||
  !/[a-z]/.test(ADMIN_SENHA) ||
  !/[A-Z]/.test(ADMIN_SENHA) ||
  !/[0-9]/.test(ADMIN_SENHA)
) {
  falhar(
    "ADMIN_SENHA deve ter de 10 a 72 bytes, com minúscula, maiúscula e número.",
  );
}

const pool = new pg.Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

try {
  const existente = await pool.query(
    "SELECT id FROM usuarios WHERE email = $1",
    [email],
  );
  if (existente.rows.length > 0) {
    falhar("Já existe uma conta com esse e-mail. Nada foi alterado.");
  }

  const hash = await bcrypt.hash(ADMIN_SENHA, 12);
  const criado = await pool.query(
    `INSERT INTO usuarios (email, senha_hash, papel)
     VALUES ($1, $2, 'administrador') RETURNING id`,
    [email, hash],
  );
  console.log(`Administrador criado (id ${criado.rows[0].id}).`);
} finally {
  await pool.end();
}
