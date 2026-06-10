import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-helpers';

export async function GET() {
  try {
    const cursos = await prisma.curso.findMany({
      orderBy: { id_curso: 'asc' },
    });
    return NextResponse.json(cursos);
  } catch (error) {
    console.error('[GET /api/cursos]', error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const adminError = requireAdmin(request);
  if (adminError) return adminError;

  try {
    const body = await request.json();
    const { nome, sigla } = body;

    if (!nome || !sigla) {
      return NextResponse.json(
        { error: 'Os campos nome e sigla são obrigatórios.' },
        { status: 400 }
      );
    }

    const curso = await prisma.curso.create({
      data: { nome, sigla },
    });

    return NextResponse.json(curso, { status: 201 });
  } catch (error) {
    console.error('[POST /api/cursos]', error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}
