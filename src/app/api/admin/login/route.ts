import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';

const ADMIN_USER = 'admin';
const ADMIN_PASS = 'admin123';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (username !== ADMIN_USER || password !== ADMIN_PASS) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret');
    const token = await new SignJWT({ sub: '1', username: ADMIN_USER })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('8h')
      .sign(secret);

    return NextResponse.json({ token });
  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
