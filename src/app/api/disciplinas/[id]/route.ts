import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-helpers';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    if (isNaN(id)) return NextResponse.json({ error: 'ID inválido.' }, { status: 400 });
    const disciplina = await prisma.disciplina.findUnique({ where: { id_disciplina: id }, include: { curso: true } });
    if (!disciplina) return NextResponse.json({ error: 'Disciplina não encontrada.' }, { status: 404 });
    return NextResponse.json(disciplina);
  } catch (error) {
    console.error('[GET /api/disciplinas/[id]]', error);
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
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
    const { id_curso, nome, carga_horaria, periodo_ideal } = body;
    const disciplina = await prisma.disciplina.update({
      where: { id_disciplina: id },
      data: { id_curso: Number(id_curso), nome, carga_horaria: Number(carga_horaria), periodo_ideal: Number(periodo_ideal) },
      include: { curso: true },
    });
    return NextResponse.json(disciplina);
  } catch (error) {
    console.error('[PUT /api/disciplinas/[id]]', error);
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const adminError = requireAdmin(request);
  if (adminError) return adminError;

  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    if (isNaN(id)) return NextResponse.json({ error: 'ID inválido.' }, { status: 400 });
    const turmas = await prisma.turma.count({ where: { id_disciplina: id } });
    if (turmas > 0) return NextResponse.json({ error: `Esta disciplina possui ${turmas} turma(s) vinculada(s).` }, { status: 409 });
    await prisma.disciplina.delete({ where: { id_disciplina: id } });
    return NextResponse.json({ message: 'Disciplina removida.' });
  } catch (error) {
    console.error('[DELETE /api/disciplinas/[id]]', error);
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}
