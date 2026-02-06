-- 020_equipamentos.sql
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS equipamentos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  codigo TEXT,                         -- opcional: "DG-01", "CLD-02"
  nome TEXT NOT NULL,                  -- "Digestor 1", "Caldeira 2"
  setor TEXT NOT NULL,                 -- "DIGESTORES", "CALDEIRAS", etc.
  localizacao TEXT,                    -- "Área 1", "Sala de máquinas"
  status TEXT NOT NULL DEFAULT 'ATIVO',-- ATIVO | INATIVO
  observacao TEXT,

  created_by INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now','-3 hours')),
  updated_at TEXT,

  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_equip_nome ON equipamentos(nome);
CREATE INDEX IF NOT EXISTS idx_equip_setor ON equipamentos(setor);
CREATE INDEX IF NOT EXISTS idx_equip_status ON equipamentos(status);
