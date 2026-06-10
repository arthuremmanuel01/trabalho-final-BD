import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-helpers';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    if (isNaN(id)) return NextResponse.json({ error: 'ID inválido.' }, { status: 400 });
    const sala = await prisma.sala.findUnique({ where: { id_sala: id }, include: { tipo: true } });
    if (!sala) return NextResponse.json({ error: 'Sala não encontrada.' }, { status: 404 });
    return NextResponse.json(sala);
  } catch (error) {
    console.error('[GET /api/salas/[id]]', error);
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
    const { id_tipo_sala, numero, capacidade } = await request.json();
    const sala = await prisma.sala.update({
      where: { id_sala: id },
      data: { id_tipo_sala: Number(id_tipo_sala), numero, capacidade: Number(capacidade) },
      include: { tipo: true },
    });
    return NextResponse.json(sala);
  } catch (error) {
    console.error('[PUT /api/salas/[id]]', error);
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
    const alocacoes = await prisma.alocacao.count({ where: { id_sala: id } });
    if (alocacoes > 0) return NextResponse.json({ error: `Esta sala possui ${alocacoes} alocação(ões). Remova primeiro.` }, { status: 409 });
    await prisma.sala.delete({ where: { id_sala: id } });
    return NextResponse.json({ message: 'Sala removida.' });
  } catch (error) {
    console.error('[DELETE /api/salas/[id]]', error);
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}
