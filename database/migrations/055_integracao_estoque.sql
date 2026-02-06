-- 055_integracao_estoque.sql
PRAGMA foreign_keys = ON;

-- Movimentações de estoque (entrada/saída/ajuste)
CREATE TABLE IF NOT EXISTS estoque_mov (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  item_id INTEGER NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('ENTRADA','SAIDA','AJUSTE')),
  quantidade REAL NOT NULL CHECK (quantidade > 0),

  origem TEXT, -- ex: "COMPRA #12" | "OS #55" | "AJUSTE INVENTÁRIO"
  observacao TEXT,

  created_by INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now','-3 hours'))

  -- 🔗 opcional (não atrapalha nada): vincular com entidade dona
  owner_type TEXT, -- 'os' | 'compra' | 'solicitacao' | 'manual'
  owner_id INTEGER,

  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (item_id) REFERENCES estoque(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_estoque_mov_item ON estoque_mov(item_id);
CREATE INDEX IF NOT EXISTS idx_estoque_mov_created_at ON estoque_mov(created_at);
CREATE INDEX IF NOT EXISTS idx_estoque_mov_owner ON estoque_mov(owner_type, owner_id);

