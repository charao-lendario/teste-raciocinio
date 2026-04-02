import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import pool from '@/lib/db';

async function verifyAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.slice(7);
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);

  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await verifyAuth(request);
    if (!payload) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const candidatoResult = await pool.query(
      `SELECT id, nome_completo, email, telefone, nota, total_questoes, percentual, aprovado, tempo_gasto, created_at
       FROM candidatos
       WHERE id = $1`,
      [id]
    );

    if (candidatoResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Candidato não encontrado' },
        { status: 404 }
      );
    }

    const respostasResult = await pool.query(
      `SELECT id, candidato_id, questao_numero, resposta_selecionada, resposta_correta, acertou, created_at
       FROM respostas
       WHERE candidato_id = $1
       ORDER BY questao_numero ASC`,
      [id]
    );

    return NextResponse.json({
      candidato: candidatoResult.rows[0],
      respostas: respostasResult.rows,
    });
  } catch (error) {
    console.error('Erro ao buscar candidato:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
