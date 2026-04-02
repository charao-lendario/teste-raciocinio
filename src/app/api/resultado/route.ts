import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      candidatoId,
      respostas,
      nota,
      totalQuestoes,
      percentual,
      aprovado,
      tempoGasto,
    } = body;

    if (!candidatoId || respostas === undefined || nota === undefined) {
      return NextResponse.json(
        { error: 'candidatoId, respostas e nota são obrigatórios' },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      await client.query(
        `UPDATE candidatos
         SET nota = $1, total_questoes = $2, percentual = $3, aprovado = $4, tempo_gasto = $5
         WHERE id = $6`,
        [nota, totalQuestoes, percentual, aprovado, tempoGasto, candidatoId]
      );

      if (Array.isArray(respostas) && respostas.length > 0) {
        const insertValues = respostas
          .map(
            (_: unknown, i: number) =>
              `($${i * 5 + 1}, $${i * 5 + 2}, $${i * 5 + 3}, $${i * 5 + 4}, $${i * 5 + 5})`
          )
          .join(', ');

        const flatParams = respostas.flatMap(
          (r: {
            questaoNumero: number;
            respostaSelecionada: string;
            respostaCorreta: string;
            acertou: boolean;
          }) => [
            candidatoId,
            r.questaoNumero,
            r.respostaSelecionada,
            r.respostaCorreta,
            r.acertou,
          ]
        );

        await client.query(
          `INSERT INTO respostas (candidato_id, questao_numero, resposta_selecionada, resposta_correta, acertou)
           VALUES ${insertValues}`,
          flatParams
        );
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao salvar resultado:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
