import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-helpers';

const FULL_INCLUDE = {
  turma: {
    include: {
      disciplina: true,
      professor: { include: { usuario: true } },
    },
  },
  sala: { include: { tipo: true } },
  dia: true,
  horario: true,
} as const;

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID inválido.' }, { status: 400 });
    }

    const alocacao = await prisma.alocacao.findUnique({
      where: { id_alocacao: id },
      include: FULL_INCLUDE,
    });

    if (!alocacao) {
      return NextResponse.json({ error: 'Alocação não encontrada.' }, { status: 404 });
    }

    return NextResponse.json(alocacao);
  } catch (error) {
    console.error('[GET /api/alocacoes/[id]]', error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const adminError = requireAdmin(request);
  if (adminError) return adminError;

  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID inválido.' }, { status: 400 });
    }

    const alocacao = await prisma.alocacao.findUnique({ where: { id_alocacao: id } });
    if (!alocacao) {
      return NextResponse.json({ error: 'Alocação não encontrada.' }, { status: 404 });
    }

    await prisma.alocacao.delete({ where: { id_alocacao: id } });
    return NextResponse.json({ message: 'Alocação excluída com sucesso.' });
  } catch (error) {
    console.error('[DELETE /api/alocacoes/[id]]', error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}
