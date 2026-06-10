import Database from 'better-sqlite3';

function main() {
  const db = new Database('./prisma/dev.db');
  
  try {
    db.exec(`DROP VIEW IF EXISTS vw_turmas_curso;`);
    db.exec(`DROP VIEW IF EXISTS vw_salas_tipo;`);

    db.exec(`
      CREATE VIEW vw_turmas_curso AS 
      SELECT t.id_turma, t.ano, t.semestre, c.nome AS curso, c.sigla, d.nome AS disciplina 
      FROM TURMA t 
      JOIN DISCIPLINA d ON t.id_disciplina = d.id_disciplina 
      JOIN CURSO c ON d.id_curso = c.id_curso;
    `);
    console.log('Created View: vw_turmas_curso');

    db.exec(`
      CREATE VIEW vw_salas_tipo AS 
      SELECT s.id_sala, s.numero, s.capacidade, ts.descricao_tipo AS tipo, a.id_alocacao 
      FROM SALA s 
      JOIN TIPO_SALA ts ON s.id_tipo_sala = ts.id_tipo_sala
      LEFT JOIN ALOCACAO a ON s.id_sala = a.id_sala;
    `);
    console.log('Created View: vw_salas_tipo');

  } catch (error) {
    console.error('Error creating views:', error);
  } finally {
    db.close();
  }
}

main();
