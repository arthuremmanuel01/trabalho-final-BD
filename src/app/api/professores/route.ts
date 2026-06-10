import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-helpers';

export async function GET() {
  try {
    const professores = await prisma.professor.findMany({
      include: { usuario: true },
      orderBy: { id_professor: 'asc' },
    });
    return NextResponse.json(professores);
  } catch (error) {
    console.error('[GET /api/professores]', error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const adminError = requireAdmin(request);
  if (adminError) return adminError;

  try {
    const body = await request.json();
    const { id_usuario, matricula, titulacao } = body;

    if (!id_usuario || !matricula || !titulacao) {
      return NextResponse.json(
        { error: 'Os campos id_usuario, matricula e titulacao são obrigatórios.' },
        { status: 400 }
      );
    }

    const professor = await prisma.professor.create({
      data: {
        id_usuario: Number(id_usuario),
        matricula,
        titulacao,
      },
      include: { usuario: true },
    });

    return NextResponse.json(professor, { status: 201 });
  } catch (error) {
    console.error('[POST /api/professores]', error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}
