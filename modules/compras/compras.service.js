const db = require("../../database/db");

function tableExists(name) {
  const row = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?")
    .get(name);
  return !!row;
}

exports.listSafe = () => {
  if (!tableExists("solicitacoes_compra")) return [];
  return db
    .prepare("SELECT * FROM solicitacoes_compra ORDER BY id DESC")
    .all();
};

exports.create = ({ descricao, prioridade, created_by }) => {
  if (!tableExists("solicitacoes_compra")) return;

  db.prepare(`
    INSERT INTO solicitacoes_compra
    (descricao, prioridade, status, created_by, created_at)
    VALUES (?, ?, 'PENDENTE', ?, datetime('now'))
  `).run(descricao, prioridade, created_by);
};
