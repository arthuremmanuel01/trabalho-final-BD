import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-helpers';

export async function GET() {
  try {
    const horarios = await prisma.horario.findMany({
      orderBy: { hora_inicio: 'asc' },
    });
    return NextResponse.json(horarios);
  } catch (error) {
    console.error('[GET /api/horarios]', error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const adminError = requireAdmin(request);
  if (adminError) return adminError;

  try {
    const body = await request.json();
    const { hora_inicio, hora_fim } = body;

    if (!hora_inicio || !hora_fim) {
      return NextResponse.json(
        { error: 'Os campos hora_inicio e hora_fim são obrigatórios.' },
        { status: 400 }
      );
    }

    const horario = await prisma.horario.create({
      data: { hora_inicio, hora_fim },
    });

    return NextResponse.json(horario, { status: 201 });
  } catch (error) {
    console.error('[POST /api/horarios]', error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}
