import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendPasswordResetEmail(to: string, token: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const resetUrl = `${appUrl}/admin/reset-password?token=${token}`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: 'Redefinição de Senha — Painel Administrativo',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0f1f3a; color: #e2e8f0; border-radius: 16px;">
        <h2 style="color: #c9a84c; margin-bottom: 16px;">Redefinição de Senha</h2>
        <p>Você solicitou a redefinição da sua senha. Clique no botão abaixo para criar uma nova senha:</p>
        <a href="${resetUrl}" style="display: inline-block; margin: 24px 0; padding: 14px 32px; background: #c9a84c; color: #0a1628; text-decoration: none; border-radius: 12px; font-weight: bold;">
          Redefinir Senha
        </a>
        <p style="font-size: 13px; color: #94a3b8;">Este link expira em <strong>1 hora</strong>. Se você não solicitou essa redefinição, ignore este email.</p>
      </div>
    `,
  });
}
