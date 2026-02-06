const db = require("../../database/db");

function tableExists(name) {
  const row = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?")
    .get(name);
  return !!row;
}

function resolveTable() {
  if (tableExists("compras")) return "compras";
  if (tableExists("solicitacoes_compra")) return "solicitacoes_compra";
  return null;
}

exports.list = ({ status } = {}) => {
  const t = resolveTable();
  if (!t) return [];

  if (status) {
    return db.prepare(`
      SELECT id, descricao, prioridade, status, created_at
      FROM ${t}
      WHERE UPPER(status) = UPPER(?)
      ORDER BY id DESC
    `).all(status);
  }

  return db.prepare(`
    SELECT id, descricao, prioridade, status, created_at
    FROM ${t}
    ORDER BY id DESC
  `).all();
};


exports.create = ({ descricao, prioridade, created_by }) => {
  const t = resolveTable();
  if (!t) {
    throw new Error(
      "Tabela de compras não encontrada (compras / solicitacoes_compra)."
    );
  }

  if (t === "compras") {
    return db.prepare(`
      INSERT INTO compras (descricao, prioridade, status, created_by, created_at)
      VALUES (?, ?, 'PENDENTE', ?, datetime('now'))
    `).run(descricao, prioridade, created_by);
  }

  // solicitacoes_compra
  return db.prepare(`
    INSERT INTO solicitacoes_compra (descricao, prioridade, status, created_by, created_at)
    VALUES (?, ?, 'PENDENTE', ?, datetime('now'))
  `).run(descricao, prioridade, created_by);
};
