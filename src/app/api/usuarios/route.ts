import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: {
        id_usuario: true,
        nome: true,
        email: true,
        perfil: true,
        professor: true,
      },
      orderBy: { id_usuario: 'asc' },
    });
    return NextResponse.json(usuarios);
  } catch (error) {
    console.error('[GET /api/usuarios]', error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}
