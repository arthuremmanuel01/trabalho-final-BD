import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const cursosMaisDeDuasTurmas = await prisma.$queryRaw`
      SELECT c.nome, c.sigla, COUNT(t.id_turma) as total_turmas
      FROM CURSO c
      JOIN DISCIPLINA d ON c.id_curso = d.id_curso
      JOIN TURMA t ON d.id_disciplina = t.id_disciplina
      GROUP BY c.id_curso
      HAVING COUNT(t.id_turma) > 2
    `;

    // A carga horária da disciplina é do semestre inteiro.
    // Dividimos por 20 (padrão de semanas no semestre) para obter a carga semanal.
    const professoresCargaHoraria = await prisma.$queryRaw`
      SELECT u.nome, p.matricula, CAST(ROUND(SUM(d.carga_horaria) / 20.0) AS INTEGER) as total_horas
      FROM PROFESSOR p
      JOIN USUARIO u ON p.id_usuario = u.id_usuario
      JOIN TURMA t ON p.id_professor = t.id_professor
      JOIN DISCIPLINA d ON t.id_disciplina = d.id_disciplina
      GROUP BY p.id_professor
      ORDER BY total_horas DESC
    `;

    const maiorMenorSalaPorDia = await prisma.$queryRaw`
      SELECT 
        d.id_dia,
        d.nome_dia,
        MAX(s.capacidade) as maior_capacidade, 
        MIN(s.capacidade) as menor_capacidade
      FROM ALOCACAO a
      JOIN SALA s ON a.id_sala = s.id_sala
      JOIN DIA d ON a.id_dia = d.id_dia
      GROUP BY d.id_dia, d.nome_dia
      ORDER BY d.id_dia
    `;

    // Laboratório é o TIPO_SALA onde descricao_tipo tem 'Laboratório'
    const mediaLugaresLabs = await prisma.$queryRaw`
      SELECT AVG(s.capacidade) as media_capacidade
      FROM SALA s
      JOIN TIPO_SALA ts ON s.id_tipo_sala = ts.id_tipo_sala
      WHERE ts.descricao_tipo LIKE '%Laboratório%'
    `;

    const salasOcupadas30a50 = await prisma.$queryRaw`
      SELECT DISTINCT s.numero, s.capacidade
      FROM ALOCACAO a
      JOIN SALA s ON a.id_sala = s.id_sala
      WHERE s.capacidade BETWEEN 30 AND 50
    `;

    const turmasPorPeriodo = await prisma.$queryRaw`
      SELECT t.id_turma, d.nome, d.periodo_ideal, u.nome as professor
      FROM TURMA t
      JOIN DISCIPLINA d ON t.id_disciplina = d.id_disciplina
      JOIN PROFESSOR p ON t.id_professor = p.id_professor
      JOIN USUARIO u ON p.id_usuario = u.id_usuario
      ORDER BY d.periodo_ideal ASC
    `;

    const viewTurmasCurso = await prisma.$queryRaw`
      SELECT * FROM vw_turmas_curso
    `;

    const viewSalasTipo = await prisma.$queryRaw`
      SELECT * FROM vw_salas_tipo
    `;

    // Serialize BigInt correctly (SQLite returns BigInt for COUNT/SUM aggregations in some Prisma queries)
    const serialize = (obj: any) => 
      JSON.parse(JSON.stringify(obj, (key, value) =>
        typeof value === 'bigint' ? Number(value) : value
      ));

    return NextResponse.json(serialize({
      cursosMaisDeDuasTurmas,
      professoresCargaHoraria,
      maiorMenorSalaPorDia,
      mediaLugaresLabs,
      salasOcupadas30a50,
      turmasPorPeriodo,
      viewTurmasCurso,
      viewSalasTipo
    }));

  } catch (error) {
    console.error('[GET /api/relatorios]', error);
    return NextResponse.json({ error: 'Erro ao gerar relatórios', details: String(error) }, { status: 500 });
  }
}
