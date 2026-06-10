import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import bcrypt from 'bcryptjs';

const adapter = new PrismaBetterSqlite3({ url: 'file:./prisma/dev.db' });
const prisma = new PrismaClient({ adapter });


async function main() {
  console.log('�xR� Iniciando seed do banco de dados...');

  const cursoSI = await prisma.curso.upsert({
    where: { id_curso: 1 },
    update: {},
    create: { nome: 'Sistemas de Informação', sigla: 'SI' },
  });
  const cursoCC = await prisma.curso.upsert({
    where: { id_curso: 2 },
    update: {},
    create: { nome: 'Ciência da Computação', sigla: 'CC' },
  });
  const cursoADS = await prisma.curso.upsert({
    where: { id_curso: 3 },
    update: {},
    create: { nome: 'Análise e Desenvolvimento de Sistemas', sigla: 'ADS' },
  });
  console.log('�S& Cursos criados:', cursoSI.sigla, cursoCC.sigla, cursoADS.sigla);

  const disc1 = await prisma.disciplina.upsert({
    where: { id_disciplina: 1 },
    update: {},
    create: { id_curso: cursoSI.id_curso, nome: 'Banco de Dados I', carga_horaria: 60, periodo_ideal: 3 },
  });
  const disc2 = await prisma.disciplina.upsert({
    where: { id_disciplina: 2 },
    update: {},
    create: { id_curso: cursoSI.id_curso, nome: 'Algoritmos e Estruturas de Dados', carga_horaria: 80, periodo_ideal: 2 },
  });
  const disc3 = await prisma.disciplina.upsert({
    where: { id_disciplina: 3 },
    update: {},
    create: { id_curso: cursoCC.id_curso, nome: 'Cálculo I', carga_horaria: 80, periodo_ideal: 1 },
  });
  const disc4 = await prisma.disciplina.upsert({
    where: { id_disciplina: 4 },
    update: {},
    create: { id_curso: cursoCC.id_curso, nome: 'Programação Orientada a Objetos', carga_horaria: 60, periodo_ideal: 2 },
  });
  const disc5 = await prisma.disciplina.upsert({
    where: { id_disciplina: 5 },
    update: {},
    create: { id_curso: cursoADS.id_curso, nome: 'Desenvolvimento Web', carga_horaria: 60, periodo_ideal: 3 },
  });
  const disc6 = await prisma.disciplina.upsert({
    where: { id_disciplina: 6 },
    update: {},
    create: { id_curso: cursoADS.id_curso, nome: 'Redes de Computadores', carga_horaria: 60, periodo_ideal: 4 },
  });
  const disc7 = await prisma.disciplina.upsert({
    where: { id_disciplina: 7 },
    update: {},
    create: { id_curso: cursoSI.id_curso, nome: 'Engenharia de Software', carga_horaria: 60, periodo_ideal: 4 },
  });
  const disc8 = await prisma.disciplina.upsert({
    where: { id_disciplina: 8 },
    update: {},
    create: { id_curso: cursoCC.id_curso, nome: 'Inteligência Artificial', carga_horaria: 60, periodo_ideal: 5 },
  });
  const disc9 = await prisma.disciplina.upsert({
    where: { id_disciplina: 9 },
    update: {},
    create: { id_curso: cursoADS.id_curso, nome: 'Segurança da Informação', carga_horaria: 40, periodo_ideal: 5 },
  });
  console.log('�S& 9 Disciplinas criadas');

  const senhaHash = await bcrypt.hash('senha123', 10);
  const adminHash = await bcrypt.hash('admin2026', 10);
  const professorHash = await bcrypt.hash('professor123', 10);

  const usuarioAdmin = await prisma.usuario.upsert({
    where: { email: 'admin@pucminas.com' },
    update: { senha: adminHash },
    create: { nome: 'Administrador', email: 'admin@pucminas.com', senha: adminHash, perfil: 'admin' },
  });
  const uProf1 = await prisma.usuario.upsert({ where: { email: 'ana@pucminas.com' }, update: {}, create: { nome: 'Ana Paula de Carvalho', email: 'ana@pucminas.com', senha: professorHash, perfil: 'professor' } });
  const uProf2 = await prisma.usuario.upsert({ where: { email: 'edwaldo@pucminas.com' }, update: {}, create: { nome: 'Edwaldo Soares Rodrigues', email: 'edwaldo@pucminas.com', senha: professorHash, perfil: 'professor' } });
  const uProf3 = await prisma.usuario.upsert({ where: { email: 'pedro.felipe@pucminas.com' }, update: {}, create: { nome: 'Pedro Felipe Alves de Oliveira', email: 'pedro.felipe@pucminas.com', senha: professorHash, perfil: 'professor' } });
  const uProf4 = await prisma.usuario.upsert({ where: { email: 'pedro.alves@pucminas.com' }, update: {}, create: { nome: 'Pedro Alves de Oliveira', email: 'pedro.alves@pucminas.com', senha: professorHash, perfil: 'professor' } });
  const uProf5 = await prisma.usuario.upsert({ where: { email: 'gustavo@pucminas.com' }, update: {}, create: { nome: 'Gustavo Luis Soares', email: 'gustavo@pucminas.com', senha: professorHash, perfil: 'professor' } });
  const uProf6 = await prisma.usuario.upsert({ where: { email: 'sinaide@pucminas.com' }, update: {}, create: { nome: 'Sinaide Nunes Bezerra', email: 'sinaide@pucminas.com', senha: professorHash, perfil: 'professor' } });
  const uProf7 = await prisma.usuario.upsert({ where: { email: 'juliana@pucminas.com' }, update: {}, create: { nome: 'Juliana Padilha', email: 'juliana@pucminas.com', senha: professorHash, perfil: 'professor' } });
  const uProf8 = await prisma.usuario.upsert({ where: { email: 'marcelo@pucminas.com' }, update: {}, create: { nome: 'Marcelo Patrocinio', email: 'marcelo@pucminas.com', senha: professorHash, perfil: 'professor' } });
  const uProf9 = await prisma.usuario.upsert({ where: { email: 'claudiney@pucminas.com' }, update: {}, create: { nome: 'Claudiney Vander Ramos', email: 'claudiney@pucminas.com', senha: professorHash, perfil: 'professor' } });
  const uProf10 = await prisma.usuario.upsert({ where: { email: 'caroline@pucminas.com' }, update: {}, create: { nome: 'Caroline Rhaian da Silva Jandre', email: 'caroline@pucminas.com', senha: professorHash, perfil: 'professor' } });
  console.log('�S& 6 Usuários criados');

  const prof1 = await prisma.professor.upsert({ where: { id_usuario: uProf1.id_usuario }, update: {}, create: { id_usuario: uProf1.id_usuario, matricula: 'MAT001', titulacao: 'Doutor' } });
  const prof2 = await prisma.professor.upsert({ where: { id_usuario: uProf2.id_usuario }, update: {}, create: { id_usuario: uProf2.id_usuario, matricula: 'MAT002', titulacao: 'Doutor' } });
  const prof3 = await prisma.professor.upsert({ where: { id_usuario: uProf3.id_usuario }, update: {}, create: { id_usuario: uProf3.id_usuario, matricula: 'MAT003', titulacao: 'Mestre' } });
  const prof4 = await prisma.professor.upsert({ where: { id_usuario: uProf4.id_usuario }, update: {}, create: { id_usuario: uProf4.id_usuario, matricula: 'MAT004', titulacao: 'Especialista' } });
  const prof5 = await prisma.professor.upsert({ where: { id_usuario: uProf5.id_usuario }, update: {}, create: { id_usuario: uProf5.id_usuario, matricula: 'MAT005', titulacao: 'Mestre' } });
  const prof6 = await prisma.professor.upsert({ where: { id_usuario: uProf6.id_usuario }, update: {}, create: { id_usuario: uProf6.id_usuario, matricula: 'MAT006', titulacao: 'Doutor' } });
  const prof7 = await prisma.professor.upsert({ where: { id_usuario: uProf7.id_usuario }, update: {}, create: { id_usuario: uProf7.id_usuario, matricula: 'MAT007', titulacao: 'Doutor' } });
  const prof8 = await prisma.professor.upsert({ where: { id_usuario: uProf8.id_usuario }, update: {}, create: { id_usuario: uProf8.id_usuario, matricula: 'MAT008', titulacao: 'Mestre' } });
  const prof9 = await prisma.professor.upsert({ where: { id_usuario: uProf9.id_usuario }, update: {}, create: { id_usuario: uProf9.id_usuario, matricula: 'MAT009', titulacao: 'Mestre' } });
  const prof10 = await prisma.professor.upsert({ where: { id_usuario: uProf10.id_usuario }, update: {}, create: { id_usuario: uProf10.id_usuario, matricula: 'MAT010', titulacao: 'Mestre' } });
  console.log('�S& 5 Professores criados');

  const tipoSalaAula = await prisma.tipoSala.upsert({
    where: { id_tipo_sala: 1 },
    update: { descricao_tipo: 'Sala de Aula' },
    create: { descricao_tipo: 'Sala de Aula' },
  });
  const tipoLab = await prisma.tipoSala.upsert({
    where: { id_tipo_sala: 2 },
    update: { descricao_tipo: 'Laboratório' },
    create: { descricao_tipo: 'Laboratório' },
  });
  const tipoAuditorio = await prisma.tipoSala.upsert({
    where: { id_tipo_sala: 3 },
    update: { descricao_tipo: 'Auditório' },
    create: { descricao_tipo: 'Auditório' },
  });
  console.log('�S& 3 Tipos de sala criados');

  const salas = await Promise.all([
    prisma.sala.upsert({ where: { id_sala: 1 }, update: {}, create: { id_tipo_sala: tipoLab.id_tipo_sala, numero: 'LAB-01', capacidade: 30 } }),
    prisma.sala.upsert({ where: { id_sala: 2 }, update: {}, create: { id_tipo_sala: tipoLab.id_tipo_sala, numero: 'LAB-02', capacidade: 30 } }),
    prisma.sala.upsert({ where: { id_sala: 3 }, update: {}, create: { id_tipo_sala: tipoLab.id_tipo_sala, numero: 'LAB-03', capacidade: 25 } }),
    prisma.sala.upsert({ where: { id_sala: 4 }, update: {}, create: { id_tipo_sala: tipoSalaAula.id_tipo_sala, numero: 'A-101', capacidade: 50 } }),
    prisma.sala.upsert({ where: { id_sala: 5 }, update: {}, create: { id_tipo_sala: tipoSalaAula.id_tipo_sala, numero: 'A-102', capacidade: 50 } }),
    prisma.sala.upsert({ where: { id_sala: 6 }, update: {}, create: { id_tipo_sala: tipoSalaAula.id_tipo_sala, numero: 'A-201', capacidade: 40 } }),
    prisma.sala.upsert({ where: { id_sala: 7 }, update: {}, create: { id_tipo_sala: tipoSalaAula.id_tipo_sala, numero: 'A-202', capacidade: 40 } }),
    prisma.sala.upsert({ where: { id_sala: 8 }, update: {}, create: { id_tipo_sala: tipoAuditorio.id_tipo_sala, numero: 'AUD-01', capacidade: 150 } }),
    prisma.sala.upsert({ where: { id_sala: 9 }, update: {}, create: { id_tipo_sala: tipoAuditorio.id_tipo_sala, numero: 'AUD-02', capacidade: 200 } }),
    prisma.sala.upsert({ where: { id_sala: 10 }, update: {}, create: { id_tipo_sala: tipoSalaAula.id_tipo_sala, numero: 'A-301', capacidade: 35 } }),
    prisma.sala.upsert({ where: { id_sala: 11 }, update: {}, create: { id_tipo_sala: tipoLab.id_tipo_sala, numero: 'LAB-04', capacidade: 30 } }),
    prisma.sala.upsert({ where: { id_sala: 12 }, update: {}, create: { id_tipo_sala: tipoSalaAula.id_tipo_sala, numero: 'A-103', capacidade: 50 } }),
    prisma.sala.upsert({ where: { id_sala: 13 }, update: {}, create: { id_tipo_sala: tipoSalaAula.id_tipo_sala, numero: 'A-104', capacidade: 50 } }),
    prisma.sala.upsert({ where: { id_sala: 14 }, update: {}, create: { id_tipo_sala: tipoSalaAula.id_tipo_sala, numero: 'A-203', capacidade: 40 } }),
    prisma.sala.upsert({ where: { id_sala: 15 }, update: {}, create: { id_tipo_sala: tipoSalaAula.id_tipo_sala, numero: 'A-204', capacidade: 40 } }),
    prisma.sala.upsert({ where: { id_sala: 16 }, update: {}, create: { id_tipo_sala: tipoAuditorio.id_tipo_sala, numero: 'AUD-03', capacidade: 120 } }),
  ]);
  console.log('�S& 10 Salas criadas');

  const dias = await Promise.all([
    prisma.dia.upsert({ where: { id_dia: 1 }, update: {}, create: { nome_dia: 'Segunda-feira' } }),
    prisma.dia.upsert({ where: { id_dia: 2 }, update: {}, create: { nome_dia: 'Terça-feira' } }),
    prisma.dia.upsert({ where: { id_dia: 3 }, update: {}, create: { nome_dia: 'Quarta-feira' } }),
    prisma.dia.upsert({ where: { id_dia: 4 }, update: {}, create: { nome_dia: 'Quinta-feira' } }),
    prisma.dia.upsert({ where: { id_dia: 5 }, update: {}, create: { nome_dia: 'Sexta-feira' } }),
  ]);
  console.log('�S& 5 Dias criados');

  const horarios = await Promise.all([
    prisma.horario.upsert({ where: { id_horario: 1 }, update: {}, create: { hora_inicio: '07:30', hora_fim: '09:10' } }),
    prisma.horario.upsert({ where: { id_horario: 2 }, update: {}, create: { hora_inicio: '09:20', hora_fim: '11:00' } }),
    prisma.horario.upsert({ where: { id_horario: 3 }, update: {}, create: { hora_inicio: '11:10', hora_fim: '12:50' } }),
    prisma.horario.upsert({ where: { id_horario: 4 }, update: {}, create: { hora_inicio: '13:00', hora_fim: '14:40' } }),
    prisma.horario.upsert({ where: { id_horario: 5 }, update: {}, create: { hora_inicio: '14:50', hora_fim: '16:30' } }),
    prisma.horario.upsert({ where: { id_horario: 6 }, update: {}, create: { hora_inicio: '16:40', hora_fim: '18:20' } }),
    prisma.horario.upsert({ where: { id_horario: 7 }, update: {}, create: { hora_inicio: '18:30', hora_fim: '20:10' } }),
    prisma.horario.upsert({ where: { id_horario: 8 }, update: {}, create: { hora_inicio: '20:20', hora_fim: '22:00' } }),
  ]);
  console.log('�S& 8 Horários criados');

  const turma1 = await prisma.turma.upsert({ where: { id_turma: 1 }, update: {}, create: { id_disciplina: disc1.id_disciplina, id_professor: prof1.id_professor, ano: 2026, semestre: 1 } });
  const turma2 = await prisma.turma.upsert({ where: { id_turma: 2 }, update: {}, create: { id_disciplina: disc2.id_disciplina, id_professor: prof2.id_professor, ano: 2026, semestre: 1 } });
  const turma3 = await prisma.turma.upsert({ where: { id_turma: 3 }, update: {}, create: { id_disciplina: disc3.id_disciplina, id_professor: prof3.id_professor, ano: 2026, semestre: 1 } });
  const turma4 = await prisma.turma.upsert({ where: { id_turma: 4 }, update: {}, create: { id_disciplina: disc4.id_disciplina, id_professor: prof4.id_professor, ano: 2026, semestre: 1 } });
  const turma5 = await prisma.turma.upsert({ where: { id_turma: 5 }, update: {}, create: { id_disciplina: disc5.id_disciplina, id_professor: prof5.id_professor, ano: 2026, semestre: 2 } });
  const turma6 = await prisma.turma.upsert({ where: { id_turma: 6 }, update: {}, create: { id_disciplina: disc6.id_disciplina, id_professor: prof1.id_professor, ano: 2026, semestre: 2 } });
  const turma7 = await prisma.turma.upsert({ where: { id_turma: 7 }, update: {}, create: { id_disciplina: disc7.id_disciplina, id_professor: prof2.id_professor, ano: 2026, semestre: 2 } });
  const turma8 = await prisma.turma.upsert({ where: { id_turma: 8 }, update: {}, create: { id_disciplina: disc8.id_disciplina, id_professor: prof3.id_professor, ano: 2026, semestre: 2 } });
  console.log('�S& 8 Turmas criadas');

  await Promise.all([
    prisma.alocacao.upsert({ where: { id_alocacao: 1 }, update: {}, create: { id_turma: turma1.id_turma, id_sala: salas[0].id_sala, id_dia: dias[0].id_dia, id_horario: horarios[0].id_horario } }),
    prisma.alocacao.upsert({ where: { id_alocacao: 2 }, update: {}, create: { id_turma: turma1.id_turma, id_sala: salas[0].id_sala, id_dia: dias[2].id_dia, id_horario: horarios[0].id_horario } }),
    prisma.alocacao.upsert({ where: { id_alocacao: 3 }, update: {}, create: { id_turma: turma2.id_turma, id_sala: salas[3].id_sala, id_dia: dias[1].id_dia, id_horario: horarios[1].id_horario } }),
    prisma.alocacao.upsert({ where: { id_alocacao: 4 }, update: {}, create: { id_turma: turma2.id_turma, id_sala: salas[3].id_sala, id_dia: dias[3].id_dia, id_horario: horarios[1].id_horario } }),
    prisma.alocacao.upsert({ where: { id_alocacao: 5 }, update: {}, create: { id_turma: turma3.id_turma, id_sala: salas[4].id_sala, id_dia: dias[0].id_dia, id_horario: horarios[2].id_horario } }),
    prisma.alocacao.upsert({ where: { id_alocacao: 6 }, update: {}, create: { id_turma: turma3.id_turma, id_sala: salas[4].id_sala, id_dia: dias[2].id_dia, id_horario: horarios[2].id_horario } }),
    prisma.alocacao.upsert({ where: { id_alocacao: 7 }, update: {}, create: { id_turma: turma4.id_turma, id_sala: salas[1].id_sala, id_dia: dias[1].id_dia, id_horario: horarios[3].id_horario } }),
    prisma.alocacao.upsert({ where: { id_alocacao: 8 }, update: {}, create: { id_turma: turma4.id_turma, id_sala: salas[1].id_sala, id_dia: dias[4].id_dia, id_horario: horarios[3].id_horario } }),
    prisma.alocacao.upsert({ where: { id_alocacao: 9 }, update: {}, create: { id_turma: turma5.id_turma, id_sala: salas[2].id_sala, id_dia: dias[2].id_dia, id_horario: horarios[4].id_horario } }),
    prisma.alocacao.upsert({ where: { id_alocacao: 10 }, update: {}, create: { id_turma: turma5.id_turma, id_sala: salas[2].id_sala, id_dia: dias[4].id_dia, id_horario: horarios[4].id_horario } }),
    prisma.alocacao.upsert({ where: { id_alocacao: 11 }, update: {}, create: { id_turma: turma6.id_turma, id_sala: salas[5].id_sala, id_dia: dias[0].id_dia, id_horario: horarios[5].id_horario } }),
    prisma.alocacao.upsert({ where: { id_alocacao: 12 }, update: {}, create: { id_turma: turma6.id_turma, id_sala: salas[5].id_sala, id_dia: dias[3].id_dia, id_horario: horarios[5].id_horario } }),
    prisma.alocacao.upsert({ where: { id_alocacao: 13 }, update: {}, create: { id_turma: turma7.id_turma, id_sala: salas[6].id_sala, id_dia: dias[1].id_dia, id_horario: horarios[6].id_horario } }),
    prisma.alocacao.upsert({ where: { id_alocacao: 14 }, update: {}, create: { id_turma: turma7.id_turma, id_sala: salas[6].id_sala, id_dia: dias[3].id_dia, id_horario: horarios[6].id_horario } }),
    prisma.alocacao.upsert({ where: { id_alocacao: 15 }, update: {}, create: { id_turma: turma8.id_turma, id_sala: salas[7].id_sala, id_dia: dias[4].id_dia, id_horario: horarios[7].id_horario } }),
  ]);
  console.log('�S& 15 Alocações criadas');

  console.log('');
  console.log('�x}0 Seed concluído com sucesso!');
  console.log('');
  console.log('�x9 Credenciais de acesso:');
  console.log('  Admin:    admin@pucminas.com / admin2026');
  console.log('  Professor: ana@pucminas.com / professor123');
}

main()
  .catch((e) => {
    console.error('�R Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
