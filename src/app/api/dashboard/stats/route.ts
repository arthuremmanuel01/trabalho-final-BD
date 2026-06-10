import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = extractTokenFromHeader(request.headers.get('Authorization'));
    if (!token) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });

    const payload = verifyToken(token);

    if (payload.perfil === 'professor') {
      const professor = await prisma.professor.findUnique({
        where: { id_usuario: payload.id },
      });

      if (!professor) {
        return NextResponse.json({ error: 'Professor não encontrado.' }, { status: 404 });
      }

      const id_professor = professor.id_professor;

      const turmasCount = await prisma.turma.count({
        where: { id_professor },
      });

      const alocacoesCount = await prisma.alocacao.count({
        where: { turma: { id_professor } },
      });

      const disciplinas = await prisma.disciplina.findMany({
        where: { turmas: { some: { id_professor } } },
      });

      const disciplinasCount = disciplinas.length;
      const cargaHoraria = disciplinas.reduce((acc, d) => acc + d.carga_horaria, 0);

      return NextResponse.json({
        isProfessor: true,
        turmas: turmasCount,
        alocacoes: alocacoesCount,
        disciplinas: disciplinasCount,
        cargaHoraria,
      });
    } else {
      const [cursos, disciplinas, professores, turmas, salas, alocacoes] =
        await Promise.all([
          prisma.curso.count(),
          prisma.disciplina.count(),
          prisma.professor.count(),
          prisma.turma.count(),
          prisma.sala.count(),
          prisma.alocacao.count(),
        ]);

      return NextResponse.json({
        isProfessor: false,
        cursos,
        disciplinas,
        professores,
        turmas,
        salas,
        alocacoes,
      });
    }
  } catch (error) {
    console.error('[GET /api/dashboard/stats]', error);
    return NextResponse.json({ error: 'Erro ao carregar estatísticas.' }, { status: 500 });
  }
}
