# PucHub — Sistema de Gestão de Horários Acadêmicos

O **PucHub** é uma plataforma moderna e intuitiva de planejamento e gestão de horários acadêmicos desenvolvida sob medida para a **PUC Minas**. O sistema permite a alocação inteligente de turmas, salas, professores e horários, resolvendo conflitos de choque de horários e otimizando a distribuição física de salas de aula, laboratórios e auditórios.

Este projeto foi construído como parte do Trabalho Prático de Banco de Dados, focando na integração entre um modelo relacional robusto no SQLite (via Prisma ORM) e uma aplicação Web de alto nível com Next.js.

---

## 🚀 Principais Funcionalidades

### 🔐 Autenticação & Controle de Acesso (RBAC)
* **Perfis Diferenciados:**
  * **Administrador (Coordenador):** Possui controle total do sistema (criar, editar, excluir registros, configurar alocações e visualizar relatórios complexos).
  * **Professor:** Acesso de visualização restrito ao Dashboard personalizado e à grade de alocações (suas turmas, salas e horários alocados). O sistema bloqueia visualmente e via rotas de API ações de edição por parte de professores.
* **Credenciais de Demonstração (Seed):**
  * **Administrador:** `admin@pucminas.com` / Senha: `admin2026`
  * **Professores:** emails no formato `nome_do_professor@pucminas.com` / Senha padrão: `professor123`

### 📅 Gestão Acadêmica Integrada
* **Cursos e Disciplinas:** Organização por período ideal e carga horária.
* **Professores:** Cadastro integrado ao usuário do sistema.
* **Turmas:** Associação de disciplina, professor responsável, ano e semestre.
* **Salas e Espaços:** Categorização por tipo (Sala de Aula, Laboratório de Informática, Auditório) com suas respectivas capacidades de alunos e blocos.
* **Quadro de Alocações:** Mapeamento de dia da semana, horário (slots de aula) e salas ocupadas, com validação inteligente de choques de horário.

### 📊 Dashboard e Relatórios Administrativos
* **Gráficos Interativos (Recharts):** Gráficos dinâmicos de ocupação por bloco, salas por tipo e distribuição de carga horária.
* **Relatórios Avançados (SQL Nativo / Agregações):**
  * Cursos com maior oferta de turmas ativas (`HAVING`).
  * Carga horária docente excedente a 40 horas (`HAVING`).
  * Análise de limite de capacidade das salas por dia da semana (`MAX` / `MIN`).
  * Média de capacidade de assentos em laboratórios (`AVG`).
  * Relação de disciplinas e período letivo.
  * Consultas integradas via Views de Banco de Dados (`vw_turmas_curso` e `vw_salas_tipo`).
  * **Ordenação e Filtros:** Pesquisa interativa por texto e ordenação interativa de colunas em tempo real.

---

## 🛠️ Stack Tecnológica

* **Frontend:** [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/)
* **Gráficos e Ícones:** [Recharts](https://recharts.org/), [Lucide React](https://lucide.dev/)
* **Autenticação:** JWT com cookies de sessão e criptografia via `bcryptjs`
* **Banco de Dados & ORM:** [Prisma ORM](https://www.prisma.io/) com banco [SQLite](https://www.sqlite.org/) local

---

## 📐 Modelo de Banco de Dados (Prisma Schema)

O esquema relacional é estruturado em torno de 10 entidades principais mapeadas na base SQLite:

* `CURSO`: Armazena a sigla e o nome da graduação.
* `DISCIPLINA`: Disciplinas pertencentes a um curso, contendo carga horária e período recomendado.
* `USUARIO`: Entidade base para credenciamento (e-mail, senha criptografada e perfil `admin` ou `professor`).
* `PROFESSOR`: Detalhes do docente vinculados ao seu registro de `USUARIO`.
* `TURMA`: Instância letiva anual/semestral de uma disciplina liderada por um professor.
* `TIPO_SALA`: Categoria física da sala (Sala de Aula, Laboratório, Auditório).
* `SALA`: Espaço físico com número de identificação e capacidade total.
* `DIA` / `HORARIO`: Definições dos slots de agendamento do campus.
* `ALOCACAO`: Entidade pivot que relaciona `TURMA`, `SALA`, `DIA` e `HORARIO`, garantindo a integridade dos agendamentos.

---

## ⚙️ Instruções de Execução

### Pré-requisitos
Certifique-se de ter o [Node.js](https://nodejs.org/) instalado na máquina (recomenda-se versão LTS 18 ou superior) e o pacote `npm`.

### 1. Clonar e Acessar o Diretório
```bash
cd horarios-academicos
```

### 2. Instalar as Dependências
```bash
npm install
```

### 3. Preparar o Banco de Dados (Prisma & SQLite)
Gere o cliente do Prisma e envie as migrações/crie as tabelas locais do SQLite:
```bash
# Gerar o Prisma Client
npm run db:generate

# Criar o banco e empurrar o esquema relacional
npm run db:push
```

### 4. Popular o Banco de Dados (Seed)
Rode a seed para cadastrar os dados reais de salas, disciplinas, dias, horários e criar os usuários (Admin e Professores com suas senhas prontas):
```bash
npm run db:seed
```

### 5. Iniciar o Servidor de Desenvolvimento
```bash
npm run dev
```
Acesse a aplicação em [http://localhost:3000](http://localhost:3000) no seu navegador.

---

## 🏛️ Identidade Visual
A identidade visual do **PucHub** foi planejada para transmitir seriedade acadêmica:
* Cores principais baseadas no branding institucional da **PUC Minas** (Vermelho Escuro `#991b1b` e Azul Marinho).
* Interfaces limpas com alto contraste de texto (Slate e Gray de fundo) e design responsivo preparado para dispositivos móveis e desktops.
