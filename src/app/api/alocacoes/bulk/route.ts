import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-helpers';

export async function POST(request: NextRequest) {
  const adminError = requireAdmin(request);
  if (adminError) return adminError;

  try {
    const body = await request.json();
    const { alocacoes } = body;

    if (!Array.isArray(alocacoes) || alocacoes.length === 0) {
      return NextResponse.json(
        { error: 'Nenhuma alocação fornecida no corpo da requisição.' },
        { status: 400 }
      );
    }

    // Executa as inserções e validações em uma transação interativa
    const result = await prisma.$transaction(async (tx) => {
      const savedAllocations = [];

      for (const aloc of alocacoes) {
        const { id_turma, id_sala, id_dia, id_horario } = aloc;

        if (!id_turma || !id_sala || !id_dia || !id_horario) {
          throw new Error(`Dados incompletos na alocação: ${JSON.stringify(aloc)}`);
        }

        const idTurma = Number(id_turma);
        const idSala = Number(id_sala);
        const idDia = Number(id_dia);
        const idHorario = Number(id_horario);

        const turma = await tx.turma.findUnique({
          where: { id_turma: idTurma },
          include: { disciplina: true },
        });

        if (!turma) {
          throw new Error(`Turma ${idTurma} não encontrada.`);
        }

        const countPerDay = await tx.alocacao.count({
          where: { id_turma: idTurma, id_dia: idDia },
        });

        if (countPerDay >= 2) {
          throw new Error(
            `Regra 1 Violada: Turma '${turma.disciplina.nome}' já possui 2 alocações no dia ${idDia}.`
          );
        }

        const conflitoPeriodo = await tx.alocacao.findFirst({
          where: {
            id_dia: idDia,
            id_horario: idHorario,
            turma: {
              disciplina: { periodo_ideal: turma.disciplina.periodo_ideal },
            },
            NOT: { id_turma: idTurma },
          },
        });

        if (conflitoPeriodo) {
          throw new Error(
            `Regra 2 Violada: Conflito de período (${turma.disciplina.periodo_ideal}º P) no dia ${idDia} e horário ${idHorario}.`
          );
        }

        const conflitoProfessor = await tx.alocacao.findFirst({
          where: {
            id_dia: idDia,
            id_horario: idHorario,
            turma: { id_professor: turma.id_professor },
            NOT: { id_turma: idTurma },
          },
        });

        if (conflitoProfessor) {
          throw new Error(
            `Regra 3 Violada: Professor já está alocado em outra turma neste dia/horário.`
          );
        }

        const conflitoFisico = await tx.alocacao.findFirst({
          where: {
            id_sala: idSala,
            id_dia: idDia,
            id_horario: idHorario,
            NOT: { id_turma: idTurma },
          },
        });

        if (conflitoFisico) {
          throw new Error(
            `Regra 4 Violada: A sala ${idSala} já está ocupada neste dia/horário.`
          );
        }

        const novaAlocacao = await tx.alocacao.create({
          data: {
            id_turma: idTurma,
            id_sala: idSala,
            id_dia: idDia,
            id_horario: idHorario,
          },
        });
        savedAllocations.push(novaAlocacao);
      }

      return savedAllocations;
    });

    return NextResponse.json(
      {
        message: 'Lote de alocações salvo com sucesso.',
        count: result.length,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[POST /api/alocacoes/bulk]', error);
    // Erros jogados manualmente na transação (regras de negócio)
    if (error.message && error.message.includes('Regra')) {
      return NextResponse.json({ error: error.message, rule: 'BULK_VALIDATION_ERROR' }, { status: 422 });
    }
    return NextResponse.json({ error: 'Erro interno ou transação abortada.' }, { status: 500 });
  }
}
