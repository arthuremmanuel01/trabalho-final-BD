import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const dias = await prisma.dia.findMany({
      orderBy: { id_dia: 'asc' },
    });
    return NextResponse.json(dias);
  } catch (error) {
    console.error('[GET /api/dias]', error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}
