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

export async function GET() {
  try {
    const alocacoes = await prisma.alocacao.findMany({
      include: FULL_INCLUDE,
      orderBy: { id_alocacao: 'asc' },
    });
    return NextResponse.json(alocacoes);
  } catch (error) {
    console.error('[GET /api/alocacoes]', error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const adminError = requireAdmin(request);
  if (adminError) return adminError;

  try {
    const body = await request.json();
    const { id_turma, id_sala, id_dia, id_horario } = body;

    if (!id_turma || !id_sala || !id_dia || !id_horario) {
      return NextResponse.json(
        { error: 'Os campos id_turma, id_sala, id_dia e id_horario são obrigatórios.' },
        { status: 400 }
      );
    }

    const idTurma = Number(id_turma);
    const idSala = Number(id_sala);
    const idDia = Number(id_dia);
    const idHorario = Number(id_horario);

    // Busca os dados da turma para validações posteriores
    const turma = await prisma.turma.findUnique({
      where: { id_turma: idTurma },
      include: { disciplina: true },
    });

    if (!turma) {
      return NextResponse.json(
        { error: 'Turma não encontrada.', rule: 'NOT_FOUND', violations: ['Turma inválida.'] },
        { status: 404 }
      );
    }

    // Valida limite máximo de 2 alocações diárias por turma
    const countPerDay = await prisma.alocacao.count({
      where: { id_turma: idTurma, id_dia: idDia },
    });

    if (countPerDay >= 2) {
      return NextResponse.json(
        {
          error: 'Esta turma já possui 2 alocações neste dia. Máximo permitido: 2 por dia.',
          rule: 'RULE_1',
          violations: [
            `Turma ${idTurma} já possui ${countPerDay} alocação(ões) no dia ${idDia}.`,
          ],
        },
        { status: 422 }
      );
    }

    // Impede disciplinas do mesmo período de compartilharem horário no mesmo dia
    const conflitoPeriodo = await prisma.alocacao.findFirst({
      where: {
        id_dia: idDia,
        id_horario: idHorario,
        turma: {
          disciplina: {
            periodo_ideal: turma.disciplina.periodo_ideal,
          },
        },
        NOT: { id_turma: idTurma },
      },
    });

    if (conflitoPeriodo) {
      return NextResponse.json(
        {
          error:
            'Conflito de período: já existe uma disciplina do período ' +
            turma.disciplina.periodo_ideal +
            ' alocada neste dia/horário.',
          rule: 'RULE_2',
          violations: [
            `Período ${turma.disciplina.periodo_ideal} já tem alocação no dia ${idDia} horário ${idHorario}.`,
          ],
        },
        { status: 422 }
      );
    }

    // Valida se o professor já não tem alocação conflitante
    const conflitoProfessor = await prisma.alocacao.findFirst({
      where: {
        id_dia: idDia,
        id_horario: idHorario,
        turma: { id_professor: turma.id_professor },
        NOT: { id_turma: idTurma },
      },
    });

    if (conflitoProfessor) {
      return NextResponse.json(
        {
          error: 'O professor já está alocado em outra turma neste mesmo dia/horário.',
          rule: 'RULE_3',
          violations: [
            `Professor ${turma.id_professor} já possui alocação no dia ${idDia} horário ${idHorario}.`,
          ],
        },
        { status: 422 }
      );
    }

    // Valida disponibilidade física da sala
    const conflitoFisico = await prisma.alocacao.findFirst({
      where: {
        id_sala: idSala,
        id_dia: idDia,
        id_horario: idHorario,
        NOT: { id_turma: idTurma },
      },
    });

    if (conflitoFisico) {
      return NextResponse.json(
        {
          error: 'Conflito de sala: esta sala já está ocupada neste dia/horário.',
          rule: 'RULE_4',
          violations: [
            `Sala ${idSala} já está ocupada no dia ${idDia} horário ${idHorario}.`,
          ],
        },
        { status: 422 }
      );
    }

    const alocacao = await prisma.alocacao.create({
      data: {
        id_turma: idTurma,
        id_sala: idSala,
        id_dia: idDia,
        id_horario: idHorario,
      },
      include: FULL_INCLUDE,
    });

    return NextResponse.json(
      {
        message: 'Alocação criada com sucesso.',
        alocacao,
        violations: [],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/alocacoes]', error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}
