import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import pool from '@/lib/db';
import { sendPasswordResetEmail } from '@/lib/mail';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      'SELECT id, email FROM admins WHERE email = $1',
      [email]
    );

    // Sempre retorna sucesso para não revelar se o email existe
    if (result.rows.length === 0) {
      return NextResponse.json({ message: 'Se o email existir, você receberá um link de redefinição.' });
    }

    const admin = result.rows[0];

    // Invalidar tokens anteriores não utilizados
    await pool.query(
      'UPDATE password_reset_tokens SET used = TRUE WHERE admin_id = $1 AND used = FALSE',
      [admin.id]
    );

    // Gerar token seguro
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await pool.query(
      'INSERT INTO password_reset_tokens (admin_id, token, expires_at) VALUES ($1, $2, $3)',
      [admin.id, token, expiresAt]
    );

    await sendPasswordResetEmail(admin.email, token);

    return NextResponse.json({ message: 'Se o email existir, você receberá um link de redefinição.' });
  } catch (error) {
    console.error('Erro no forgot-password:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
