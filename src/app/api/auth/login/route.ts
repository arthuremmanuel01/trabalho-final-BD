import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signToken, comparePassword } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, senha } = body;

    if (!email || !senha) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: email, senha.' },
        { status: 400 }
      );
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email },
      include: {
        professor: {
          select: {
            id_professor: true,
            matricula: true,
            titulacao: true,
          },
        },
      },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: 'Credenciais inválidas.' },
        { status: 401 }
      );
    }

    const senhaValida = await comparePassword(senha, usuario.senha);
    if (!senhaValida) {
      return NextResponse.json(
        { error: 'Credenciais inválidas.' },
        { status: 401 }
      );
    }

    const token = signToken({
      id: usuario.id_usuario,
      email: usuario.email,
      nome: usuario.nome,
      perfil: usuario.perfil,
    });

    return NextResponse.json({
      message: 'Login realizado com sucesso.',
      token,
      usuario: {
        id: usuario.id_usuario,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
        professor: usuario.professor,
      },
    });
  } catch (error) {
    console.error('[POST /api/auth/login]', error);
    return NextResponse.json(
      { error: 'Erro interno ao realizar login.' },
      { status: 500 }
    );
  }
}
