PRAGMA foreign_keys = ON;

ALTER TABLE os ADD COLUMN equipamento_id INTEGER;

CREATE INDEX IF NOT EXISTS idx_os_equipamento_id ON os(equipamento_id);
