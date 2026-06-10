import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-helpers';

export async function GET() {
  try {
    const disciplinas = await prisma.disciplina.findMany({
      include: { curso: true },
      orderBy: { id_disciplina: 'asc' },
    });
    return NextResponse.json(disciplinas);
  } catch (error) {
    console.error('[GET /api/disciplinas]', error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const adminError = requireAdmin(request);
  if (adminError) return adminError;

  try {
    const body = await request.json();
    const { id_curso, nome, carga_horaria, periodo_ideal } = body;

    if (!id_curso || !nome || !carga_horaria || !periodo_ideal) {
      return NextResponse.json(
        { error: 'Os campos id_curso, nome, carga_horaria e periodo_ideal são obrigatórios.' },
        { status: 400 }
      );
    }

    const disciplina = await prisma.disciplina.create({
      data: {
        id_curso: Number(id_curso),
        nome,
        carga_horaria: Number(carga_horaria),
        periodo_ideal: Number(periodo_ideal),
      },
      include: { curso: true },
    });

    return NextResponse.json(disciplina, { status: 201 });
  } catch (error) {
    console.error('[POST /api/disciplinas]', error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}
