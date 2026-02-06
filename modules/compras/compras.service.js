const db = require("../../database/db");

// lista solicitações
exports.listSolicitacoes = ({ status }) => {
  return db
    .prepare(
      `
      SELECT id, titulo, setor, prioridade, status, created_at
      FROM solicitacoes
      WHERE status = ?
      ORDER BY id DESC
    `
    )
    .all(status);
};

// cria solicitação
exports.createSolicitacao = ({ titulo, descricao, setor, prioridade, created_by }) => {
  const res = db
    .prepare(
      `
      INSERT INTO solicitacoes (titulo, descricao, setor, prioridade, status, created_by, created_at)
      VALUES (?, ?, ?, ?, 'ABERTA', ?, datetime('now'))
    `
    )
    .run(titulo, descricao, setor, prioridade, created_by);

  return res.lastInsertRowid;
};
