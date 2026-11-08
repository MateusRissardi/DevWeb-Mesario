import { NextResponse } from 'next/server';
import pool from '@/lib/db';

function mensagemErro(error: unknown) {
  return error instanceof Error ? error.message : 'Erro interno';
}

// READ: Buscar mesário por CPF ou listar todos
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cpf = searchParams.get('cpf');

    const client = await pool.connect();

    if (cpf) {
      const result = await client.query('SELECT * FROM mesarios WHERE cpf = $1', [cpf]);
      client.release();
      if (result.rows.length === 0) {
        return NextResponse.json({ success: false, message: 'Mesário não encontrado' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: result.rows[0] }, { status: 200 });
    }

    const result = await client.query('SELECT * FROM mesarios ORDER BY id DESC');
    client.release();
    return NextResponse.json({ success: true, data: result.rows }, { status: 200 });

  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: mensagemErro(error) }, { status: 500 });
  }
}

// CREATE: Cadastrar novo mesário 
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      cpf, titulo_eleitor, nome_civil, data_nascimento,
      nome_mae, nome_pai, municipio, zona_eleitoral,
      secao_eleitoral, local_votacao, telefone, email
    } = body;

    const query = `
      INSERT INTO mesarios 
      (cpf, titulo_eleitor, nome_civil, data_nascimento, nome_mae, nome_pai, municipio, zona_eleitoral, secao_eleitoral, local_votacao, telefone, email)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *;
    `;

    const cpfNormalizado = typeof cpf === 'string' ? cpf.replace(/\D/g, '') : '';
    if (cpfNormalizado.length !== 11) {
      return NextResponse.json({ success: false, message: 'Informe um CPF válido' }, { status: 400 });
    }

    const values = [
      cpfNormalizado, titulo_eleitor, nome_civil, data_nascimento,
      nome_mae, nome_pai, municipio, zona_eleitoral,
      secao_eleitoral, local_votacao, telefone, email
    ];

    const client = await pool.connect();
    try {
      const result = await client.query(query, values);
      return NextResponse.json({ success: true, data: result.rows[0] }, { status: 201 });
    } finally {
      client.release();
    }
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: mensagemErro(error) }, { status: 500 });
  }
}

// UPDATE: Atualizar dados do mesário (Botão "Atualizar Dados")
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { cpf, telefone, email, status_interesse } = body;
    const cpfNormalizado = typeof cpf === 'string' ? cpf.replace(/\D/g, '') : '';

    if (cpfNormalizado.length !== 11 || typeof status_interesse !== 'boolean') {
      return NextResponse.json({ success: false, message: 'CPF ou status de interesse inválido' }, { status: 400 });
    }

    const query = `
      UPDATE mesarios 
      SET telefone = $1, email = $2, status_interesse = $3
      WHERE cpf = $4
      RETURNING *;
    `;

    const client = await pool.connect();
    try {
      const result = await client.query(query, [telefone, email, status_interesse, cpfNormalizado]);
      if (result.rows.length === 0) {
        return NextResponse.json({ success: false, message: 'Mesário não encontrado para atualização' }, { status: 404 });
      }

      return NextResponse.json({ success: true, data: result.rows[0] }, { status: 200 });
    } finally {
      client.release();
    }
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: mensagemErro(error) }, { status: 500 });
  }
}

// DELETE: Excluir cadastro pelo CPF
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cpf = searchParams.get('cpf');

    if (!cpf) {
      return NextResponse.json({ success: false, message: 'Informe o CPF do mesário' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      const result = await client.query('DELETE FROM mesarios WHERE cpf = $1 RETURNING cpf', [cpf]);
      if (result.rows.length === 0) {
        return NextResponse.json({ success: false, message: 'Mesário não encontrado para exclusão' }, { status: 404 });
      }

      return NextResponse.json({ success: true, data: result.rows[0] }, { status: 200 });
    } finally {
      client.release();
    }
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: mensagemErro(error) }, { status: 500 });
  }
}