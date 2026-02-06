const db = require("../../database/db");

function tableExists(name) {
  const row = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?")
    .get(name);
  return !!row;
}

exports.list = () => {
  if (!tableExists("solicitacoes")) return [];

  return db.prepare(`
    SELECT
      id,
      titulo,
      setor,
      prioridade,
      status,
      created_at
    FROM solicitacoes
    ORDER BY id DESC
  `).all();
};

exports.create = ({ titulo, descricao, setor, prioridade, created_by }) => {
  if (!tableExists("solicitacoes")) return;

  db.prepare(`
    INSERT INTO solicitacoes
    (titulo, descricao, setor, prioridade, status, created_by, created_at)
    VALUES (?, ?, ?, ?, 'ABERTA', ?, datetime('now'))
  `).run(titulo, descricao, setor, prioridade, created_by);
};
