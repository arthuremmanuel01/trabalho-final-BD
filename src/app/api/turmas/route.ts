import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-helpers';

export async function GET() {
  try {
    const turmas = await prisma.turma.findMany({
      include: {
        disciplina: { include: { curso: true } },
        professor: {
          include: { usuario: true },
        },
      },
      orderBy: { id_turma: 'asc' },
    });
    return NextResponse.json(turmas);
  } catch (error) {
    console.error('[GET /api/turmas]', error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const adminError = requireAdmin(request);
  if (adminError) return adminError;

  try {
    const body = await request.json();
    const { id_disciplina, id_professor, ano, semestre } = body;

    if (!id_disciplina || !id_professor || !ano || !semestre) {
      return NextResponse.json(
        { error: 'Os campos id_disciplina, id_professor, ano e semestre são obrigatórios.' },
        { status: 400 }
      );
    }

    const turma = await prisma.turma.create({
      data: {
        id_disciplina: Number(id_disciplina),
        id_professor: Number(id_professor),
        ano: Number(ano),
        semestre: Number(semestre),
      },
      include: {
        disciplina: { include: { curso: true } },
        professor: {
          include: { usuario: true },
        },
      },
    });

    return NextResponse.json(turma, { status: 201 });
  } catch (error) {
    console.error('[POST /api/turmas]', error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}
