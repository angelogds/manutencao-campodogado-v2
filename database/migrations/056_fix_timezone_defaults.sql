-- 056_fix_timezone_defaults.sql
PRAGMA foreign_keys = ON;

-- A ideia é: parar de gravar "-3 hours" no banco e manter UTC.
-- Como SQLite não altera DEFAULT direto, recriamos as tabelas mantendo dados.

BEGIN TRANSACTION;

-- ===== SOLICITACOES =====
ALTER TABLE solicitacoes RENAME TO solicitacoes_old;

CREATE TABLE solicitacoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  setor TEXT NOT NULL,
  prioridade TEXT NOT NULL DEFAULT 'NORMAL',
  status TEXT NOT NULL DEFAULT 'ABERTA',
  created_by INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

INSERT INTO solicitacoes (id,titulo,descricao,setor,prioridade,status,created_by,created_at)
SELECT id,titulo,descricao,setor,prioridade,status,created_by,created_at
FROM solicitacoes_old;

DROP TABLE solicitacoes_old;

-- ===== COTACOES =====
ALTER TABLE cotacoes RENAME TO cotacoes_old;

CREATE TABLE cotacoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  solicitacao_id INTEGER NOT NULL,
  fornecedor TEXT NOT NULL,
  prazo_dias INTEGER NOT NULL DEFAULT 0,
  total REAL NOT NULL DEFAULT 0,
  created_by INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (solicitacao_id) REFERENCES solicitacoes(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

INSERT INTO cotacoes (id,solicitacao_id,fornecedor,prazo_dias,total,created_by,created_at)
SELECT id,solicitacao_id,fornecedor,prazo_dias,total,created_by,created_at
FROM cotacoes_old;

DROP TABLE cotacoes_old;

-- ===== ESTOQUE =====
ALTER TABLE estoque RENAME TO estoque_old;

CREATE TABLE estoque (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  descricao TEXT NOT NULL,
  unidade TEXT NOT NULL DEFAULT 'UN',
  quantidade REAL NOT NULL DEFAULT 0,
  valor_unitario REAL NOT NULL DEFAULT 0,
  atualizado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO estoque (id,descricao,unidade,quantidade,valor_unitario,atualizado_em)
SELECT id,descricao,unidade,quantidade,valor_unitario,atualizado_em
FROM estoque_old;

DROP TABLE estoque_old;

-- ===== ESTOQUE_MOV =====
ALTER TABLE estoque_mov RENAME TO estoque_mov_old;

CREATE TABLE estoque_mov (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id INTEGER NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('ENTRADA','SAIDA','AJUSTE')),
  quantidade REAL NOT NULL CHECK (quantidade > 0),
  origem TEXT,
  observacao TEXT,
  created_by INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  owner_type TEXT,
  owner_id INTEGER,
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (item_id) REFERENCES estoque(id) ON DELETE RESTRICT
);

INSERT INTO estoque_mov (id,item_id,tipo,quantidade,origem,observacao,created_by,created_at,owner_type,owner_id)
SELECT id,item_id,tipo,quantidade,origem,observacao,created_by,created_at,owner_type,owner_id
FROM estoque_mov_old;

DROP TABLE estoque_mov_old;

COMMIT;
