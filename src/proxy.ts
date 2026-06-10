import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Rotas públicas que não precisam de autenticação
const PUBLIC_ROUTES = [
  '/api/auth/login',
  '/api/auth/register',
];

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'horarios_academicos_super_secret_key_2026'
);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/')) {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token de autenticação não fornecido.' },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7);

    try {
      await jwtVerify(token, JWT_SECRET);
      return NextResponse.next();
    } catch {
      return NextResponse.json(
        { error: 'Token inválido ou expirado.' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
