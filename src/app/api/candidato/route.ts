import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nomeCompleto, email, telefone } = body;

    if (!nomeCompleto || !email || !telefone) {
      return NextResponse.json(
        { error: 'nomeCompleto, email e telefone são obrigatórios' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `INSERT INTO candidatos (nome_completo, email, telefone)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [nomeCompleto, email, telefone]
    );

    return NextResponse.json({ id: result.rows[0].id }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar candidato:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
