import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signToken, hashPassword } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nome, email, senha, perfil } = body;

    if (!nome || !email || !senha) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: nome, email, senha.' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.usuario.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: 'E-mail já cadastrado.' },
        { status: 409 }
      );
    }

    const senhaHash = await hashPassword(senha);
    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha: senhaHash,
        perfil: perfil || 'professor',
      },
    });

    const token = signToken({
      id: usuario.id_usuario,
      email: usuario.email,
      nome: usuario.nome,
      perfil: usuario.perfil,
    });

    return NextResponse.json(
      {
        message: 'Usuário cadastrado com sucesso.',
        token,
        usuario: {
          id: usuario.id_usuario,
          nome: usuario.nome,
          email: usuario.email,
          perfil: usuario.perfil,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/auth/register]', error);
    return NextResponse.json(
      { error: 'Erro interno ao cadastrar usuário.' },
      { status: 500 }
    );
  }
}
