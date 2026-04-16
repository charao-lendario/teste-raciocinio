import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token e nova senha são obrigatórios' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `SELECT prt.id AS token_id, prt.admin_id, prt.expires_at
       FROM password_reset_tokens prt
       WHERE prt.token = $1 AND prt.used = FALSE`,
      [token]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Token inválido ou já utilizado' },
        { status: 400 }
      );
    }

    const resetToken = result.rows[0];

    if (new Date(resetToken.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Token expirado. Solicite uma nova redefinição.' },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('UPDATE admins SET password_hash = $1 WHERE id = $2', [passwordHash, resetToken.admin_id]);
      await client.query('UPDATE password_reset_tokens SET used = TRUE WHERE id = $1', [resetToken.token_id]);
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    return NextResponse.json({ message: 'Senha redefinida com sucesso!' });
  } catch (error) {
    console.error('Erro no reset-password:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
