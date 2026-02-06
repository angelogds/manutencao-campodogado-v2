-- 050_estoque_compras.sql
PRAGMA foreign_keys = ON;

-- =========================
-- ESTOQUE
-- =========================
CREATE TABLE IF NOT EXISTS estoque (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  descricao TEXT NOT NULL,
  unidade TEXT NOT NULL DEFAULT 'UN',
  quantidade REAL NOT NULL DEFAULT 0,
  valor_unitario REAL NOT NULL DEFAULT 0,
  atualizado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_estoque_desc ON estoque(descricao);


-- =========================
-- SOLICITAÇÕES (Manutenção -> Compras)
-- =========================
CREATE TABLE IF NOT EXISTS solicitacoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  setor TEXT NOT NULL,
  prioridade TEXT NOT NULL DEFAULT 'NORMAL', -- BAIXA | NORMAL | ALTA | URGENTE
  status TEXT NOT NULL DEFAULT 'ABERTA',     -- ABERTA | EM_COTACAO | APROVADA | REPROVADA | COMPRADA | RECEBIDA | CANCELADA
  created_by INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now','-3 hours')),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_solicitacoes_status ON solicitacoes(status);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_setor ON solicitacoes(setor);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_created_at ON solicitacoes(created_at);


-- Itens da solicitação
CREATE TABLE IF NOT EXISTS solicitacao_itens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  solicitacao_id INTEGER NOT NULL,
  descricao TEXT NOT NULL,
  unidade TEXT NOT NULL DEFAULT 'UN',
  quantidade REAL NOT NULL,
  observacao TEXT,
  FOREIGN KEY (solicitacao_id) REFERENCES solicitacoes(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_solic_itens_sol ON solicitacao_itens(solicitacao_id);


-- =========================
-- COTAÇÕES (Compras)
-- =========================
CREATE TABLE IF NOT EXISTS cotacoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  solicitacao_id INTEGER NOT NULL,
  fornecedor TEXT NOT NULL,
  prazo_dias INTEGER NOT NULL DEFAULT 0,
  total REAL NOT NULL DEFAULT 0,
  created_by INTEGER,
created_at TEXT NOT NULL DEFAULT (datetime('now','-3 hours')),
  FOREIGN KEY (solicitacao_id) REFERENCES solicitacoes(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_cotacoes_sol ON cotacoes(solicitacao_id);
CREATE INDEX IF NOT EXISTS idx_cotacoes_created_at ON cotacoes(created_at);


-- Itens da cotação
CREATE TABLE IF NOT EXISTS cotacao_itens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cotacao_id INTEGER NOT NULL,
  descricao TEXT NOT NULL,
  unidade TEXT NOT NULL DEFAULT 'UN',
  quantidade REAL NOT NULL,
  valor_unitario REAL NOT NULL,
  subtotal REAL NOT NULL,
  FOREIGN KEY (cotacao_id) REFERENCES cotacoes(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_cot_itens_cot ON cotacao_itens(cotacao_id);


