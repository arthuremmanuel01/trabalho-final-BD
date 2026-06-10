import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-helpers';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    if (isNaN(id)) return NextResponse.json({ error: 'ID inválido.' }, { status: 400 });
    const professor = await prisma.professor.findUnique({ where: { id_professor: id }, include: { usuario: true } });
    if (!professor) return NextResponse.json({ error: 'Professor não encontrado.' }, { status: 404 });
    return NextResponse.json(professor);
  } catch (error) {
    console.error('[GET /api/professores/[id]]', error);
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
    const { matricula, titulacao } = await request.json();
    const professor = await prisma.professor.update({
      where: { id_professor: id },
      data: { matricula, titulacao },
      include: { usuario: true },
    });
    return NextResponse.json(professor);
  } catch (error) {
    console.error('[PUT /api/professores/[id]]', error);
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
    const turmas = await prisma.turma.count({ where: { id_professor: id } });
    if (turmas > 0) return NextResponse.json({ error: `Este professor possui ${turmas} turma(s) vinculada(s).` }, { status: 409 });
    await prisma.professor.delete({ where: { id_professor: id } });
    return NextResponse.json({ message: 'Professor removido.' });
  } catch (error) {
    console.error('[DELETE /api/professores/[id]]', error);
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}
