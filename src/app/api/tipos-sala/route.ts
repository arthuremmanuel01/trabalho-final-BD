import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const tiposSala = await prisma.tipoSala.findMany({
      orderBy: { id_tipo_sala: 'asc' },
    });
    return NextResponse.json(tiposSala);
  } catch (error) {
    console.error('[GET /api/tipos-sala]', error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}
