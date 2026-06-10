import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-helpers';

export async function GET() {
  try {
    const salas = await prisma.sala.findMany({
      include: { tipo: true },
      orderBy: { id_sala: 'asc' },
    });
    return NextResponse.json(salas);
  } catch (error) {
    console.error('[GET /api/salas]', error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const adminError = requireAdmin(request);
  if (adminError) return adminError;

  try {
    const body = await request.json();
    const { id_tipo_sala, numero, capacidade } = body;

    if (!id_tipo_sala || !numero || !capacidade) {
      return NextResponse.json(
        { error: 'Os campos id_tipo_sala, numero e capacidade são obrigatórios.' },
        { status: 400 }
      );
    }

    const sala = await prisma.sala.create({
      data: {
        id_tipo_sala: Number(id_tipo_sala),
        numero,
        capacidade: Number(capacidade),
      },
      include: { tipo: true },
    });

    return NextResponse.json(sala, { status: 201 });
  } catch (error) {
    console.error('[POST /api/salas]', error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}
