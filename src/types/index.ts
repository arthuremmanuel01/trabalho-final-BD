// ========================================
// Tipos compartilhados entre API e UI
// Sistema de Gestão de Horários Acadêmicos
// ========================================

export interface Curso {
  id_curso: number;
  nome: string;
  sigla: string;
  disciplinas?: Disciplina[];
}

export interface Disciplina {
  id_disciplina: number;
  id_curso: number;
  nome: string;
  carga_horaria: number;
  periodo_ideal: number;
  curso?: Curso;
}

export interface Usuario {
  id_usuario: number;
  nome: string;
  email: string;
  perfil: string;
  professor?: Professor;
}

export interface Professor {
  id_professor: number;
  id_usuario: number;
  matricula: string;
  titulacao: string;
  usuario?: Usuario;
  turmas?: Turma[];
}

export interface Turma {
  id_turma: number;
  id_disciplina: number;
  id_professor: number;
  ano: number;
  semestre: number;
  disciplina?: Disciplina;
  professor?: Professor;
  alocacoes?: Alocacao[];
}

export interface TipoSala {
  id_tipo_sala: number;
  descricao_tipo: string;
  salas?: Sala[];
}

export interface Sala {
  id_sala: number;
  id_tipo_sala: number;
  numero: string;
  capacidade: number;
  tipo?: TipoSala;
  alocacoes?: Alocacao[];
}

export interface Dia {
  id_dia: number;
  nome_dia: string;
  alocacoes?: Alocacao[];
}

export interface Horario {
  id_horario: number;
  hora_inicio: string;
  hora_fim: string;
  alocacoes?: Alocacao[];
}

export interface Alocacao {
  id_alocacao: number;
  id_turma: number;
  id_sala: number;
  id_dia: number;
  id_horario: number;
  turma?: Turma;
  sala?: Sala;
  dia?: Dia;
  horario?: Horario;
}

// ---- Auth ----
export interface AuthUser {
  id: number;
  nome: string;
  email: string;
  perfil: 'admin' | 'professor' | string;
  professor?: {
    id_professor: number;
    matricula: string;
    titulacao: string;
  } | null;
}

// ---- API Error ----
export interface ApiError {
  error: string;
  rule?: string;
  violations?: string[];
}

// ---- Business Rule Names ----
export const BUSINESS_RULES = {
  MAX_ALOCACOES_POR_DIA: 'RULE_1',
  CONFLITO_PERIODO_IDEAL: 'RULE_2',
  CONFLITO_PROFESSOR: 'RULE_3',
  CONFLITO_FISICO_SALA: 'RULE_4',
} as const;
