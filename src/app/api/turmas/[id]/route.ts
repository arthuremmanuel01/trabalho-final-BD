import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-helpers';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    if (isNaN(id)) return NextResponse.json({ error: 'ID inválido.' }, { status: 400 });
    const turma = await prisma.turma.findUnique({
      where: { id_turma: id },
      include: { disciplina: { include: { curso: true } }, professor: { include: { usuario: true } } },
    });
    if (!turma) return NextResponse.json({ error: 'Turma não encontrada.' }, { status: 404 });
    return NextResponse.json(turma);
  } catch (error) {
    console.error('[GET /api/turmas/[id]]', error);
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
    const { id_disciplina, id_professor, ano, semestre } = await request.json();
    const turma = await prisma.turma.update({
      where: { id_turma: id },
      data: { id_disciplina: Number(id_disciplina), id_professor: Number(id_professor), ano: Number(ano), semestre: Number(semestre) },
      include: { disciplina: { include: { curso: true } }, professor: { include: { usuario: true } } },
    });
    return NextResponse.json(turma);
  } catch (error) {
    console.error('[PUT /api/turmas/[id]]', error);
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
    const alocacoes = await prisma.alocacao.count({ where: { id_turma: id } });
    if (alocacoes > 0) await prisma.alocacao.deleteMany({ where: { id_turma: id } });
    await prisma.turma.delete({ where: { id_turma: id } });
    return NextResponse.json({ message: 'Turma removida.' });
  } catch (error) {
    console.error('[DELETE /api/turmas/[id]]', error);
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}
