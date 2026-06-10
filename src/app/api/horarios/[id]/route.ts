import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-helpers';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    if (isNaN(id)) return NextResponse.json({ error: 'ID inválido.' }, { status: 400 });
    const horario = await prisma.horario.findUnique({ where: { id_horario: id } });
    if (!horario) return NextResponse.json({ error: 'Horário não encontrado.' }, { status: 404 });
    return NextResponse.json(horario);
  } catch (error) {
    console.error('[GET /api/horarios/[id]]', error);
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
    const { hora_inicio, hora_fim } = await request.json();
    const horario = await prisma.horario.update({ where: { id_horario: id }, data: { hora_inicio, hora_fim } });
    return NextResponse.json(horario);
  } catch (error) {
    console.error('[PUT /api/horarios/[id]]', error);
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
    const alocacoes = await prisma.alocacao.count({ where: { id_horario: id } });
    if (alocacoes > 0) return NextResponse.json({ error: `Este horário possui ${alocacoes} alocação(ões). Remova primeiro.` }, { status: 409 });
    await prisma.horario.delete({ where: { id_horario: id } });
    return NextResponse.json({ message: 'Horário removido.' });
  } catch (error) {
    console.error('[DELETE /api/horarios/[id]]', error);
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}
