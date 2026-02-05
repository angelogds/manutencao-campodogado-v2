PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS estoque_mov (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id INTEGER NOT NULL,
  tipo TEXT NOT NULL, -- ENTRADA | SAIDA | AJUSTE
  quantidade REAL NOT NULL,
  origem TEXT, -- ex: "COMPRA #12"
  created_by INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_estoque_mov_item ON estoque_mov(item_id);
