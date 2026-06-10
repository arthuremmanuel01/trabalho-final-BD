import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-helpers';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    if (isNaN(id)) return NextResponse.json({ error: 'ID inválido.' }, { status: 400 });

    const curso = await prisma.curso.findUnique({ where: { id_curso: id } });
    if (!curso) return NextResponse.json({ error: 'Curso não encontrado.' }, { status: 404 });
    return NextResponse.json(curso);
  } catch (error) {
    console.error('[GET /api/cursos/[id]]', error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const adminError = requireAdmin(request);
  if (adminError) return adminError;

  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    if (isNaN(id)) return NextResponse.json({ error: 'ID inválido.' }, { status: 400 });

    const body = await request.json();
    const { nome, sigla } = body;
    if (!nome || !sigla) return NextResponse.json({ error: 'Campos nome e sigla são obrigatórios.' }, { status: 400 });

    const existing = await prisma.curso.findUnique({ where: { id_curso: id } });
    if (!existing) return NextResponse.json({ error: 'Curso não encontrado.' }, { status: 404 });

    const curso = await prisma.curso.update({ where: { id_curso: id }, data: { nome, sigla } });
    return NextResponse.json(curso);
  } catch (error) {
    console.error('[PUT /api/cursos/[id]]', error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const adminError = requireAdmin(request);
  if (adminError) return adminError;

  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    if (isNaN(id)) return NextResponse.json({ error: 'ID inválido.' }, { status: 400 });

    const disciplinas = await prisma.disciplina.count({ where: { id_curso: id } });
    if (disciplinas > 0) {
      return NextResponse.json(
        { error: `Este curso possui ${disciplinas} disciplina(s) vinculada(s). Remova-as primeiro.` },
        { status: 409 }
      );
    }
    await prisma.curso.delete({ where: { id_curso: id } });
    return NextResponse.json({ message: 'Curso removido com sucesso.' });
  } catch (error) {
    console.error('[DELETE /api/cursos/[id]]', error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}
