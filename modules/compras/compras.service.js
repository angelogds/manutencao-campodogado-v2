const db = require("../../database/db");

function tableExists(name) {
  const row = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?")
    .get(name);
  return !!row;
}

// ===== LISTA SOLICITAÇÕES =====
exports.listSolicitacoes = ({ status } = {}) => {
  if (!tableExists("solicitacoes")) return [];

  // sem join em users (porque teu users pode não ter coluna "nome")
  if (status && status !== "TODOS") {
    return db
      .prepare(
        `
        SELECT
          id, titulo, setor, prioridade, status, created_at, created_by
        FROM solicitacoes
        WHERE status = ?
        ORDER BY id DESC
      `
      )
      .all(status);
  }

  return db
    .prepare(
      `
      SELECT
        id, titulo, setor, prioridade, status, created_at, created_by
      FROM solicitacoes
      ORDER BY id DESC
    `
    )
    .all();
};

// ===== CRIA SOLICITAÇÃO =====
exports.createSolicitacao = ({ titulo, descricao, setor, prioridade, created_by }) => {
  if (!tableExists("solicitacoes")) {
    throw new Error("Tabela solicitacoes não existe. Rode as migrations.");
  }

  const res = db
    .prepare(
      `
      INSERT INTO solicitacoes (titulo, descricao, setor, prioridade, status, created_by, created_at)
      VALUES (?, ?, ?, ?, 'ABERTA', ?, datetime('now'))
    `
    )
    .run(titulo, descricao, setor, prioridade || "NORMAL", created_by);

  return res.lastInsertRowid;
};

// ===== PEGA 1 SOLICITAÇÃO =====
exports.getSolicitacaoById = (id) => {
  if (!tableExists("solicitacoes")) return null;

  return db
    .prepare(
      `
      SELECT
        id, titulo, descricao, setor, prioridade, status, created_at, created_by
      FROM solicitacoes
      WHERE id = ?
    `
    )
    .get(id);
};
