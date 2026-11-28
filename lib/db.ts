import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, 
  },
});

// Conexão ociosa derrubada pelo servidor (reinício, limite do pooler): sem este
// tratador o Node derruba o processo e despeja o objeto da conexão no log.
pool.on('error', (erro) => {
  console.error('[pg] erro em conexão ociosa:', erro.message);
});

export default pool;