const db = require("../../database/db");

function tableExists(name) {
  const row = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?")
    .get(name);
  return !!row;
}

function ensureTable() {
  if (!tableExists("solicitacoes_compra")) {
    throw new Error("Tabela solicitacoes_compra não existe. Rode as migrations.");
  }
}

exports.list = ({ status }) => {
  ensureTable();
  return db.prepare(`
    SELECT id, descricao, prioridade, status, created_at
    FROM solicitacoes_compra
    WHERE status = ?
    ORDER BY id DESC
  `).all(status || "PENDENTE");
};

exports.create = ({ descricao, prioridade, created_by }) => {
  ensureTable();
  const res = db.prepare(`
    INSERT INTO solicitacoes_compra (descricao, prioridade, status, created_by, created_at)
    VALUES (?, ?, 'PENDENTE', ?, datetime('now'))
  `).run(descricao, prioridade || "NORMAL", created_by || null);

  return res.lastInsertRowid;
};

exports.updateStatus = ({ id, status }) => {
  ensureTable();
  const allowed = ["PENDENTE", "APROVADA", "RECEBIDA", "CANCELADA"];
  const st = String(status || "").toUpperCase();
  if (!allowed.includes(st)) throw new Error("Status inválido.");

  db.prepare(`
    UPDATE solicitacoes_compra
    SET status = ?
    WHERE id = ?
  `).run(st, Number(id));
};
