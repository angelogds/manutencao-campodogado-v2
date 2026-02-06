const db = require("../../database/db");

function tableExists(name) {
  const row = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?")
    .get(name);
  return !!row;
}

function userNameExpr() {
  // escolhe a melhor coluna existente em users
  // se não existir nenhuma, retorna string vazia
  if (!tableExists("users")) return "''";

  const cols = db.prepare("PRAGMA table_info(users)").all().map((c) => c.name);

  if (cols.includes("nome")) return "COALESCE(u.nome,'')";
  if (cols.includes("name")) return "COALESCE(u.name,'')";
  if (cols.includes("nome_completo")) return "COALESCE(u.nome_completo,'')";
  if (cols.includes("usuario")) return "COALESCE(u.usuario,'')";
  if (cols.includes("email")) return "COALESCE(u.email,'')";
  return "''";
}

exports.listSolicitacoes = ({ status }) => {
  const hasSolic = tableExists("solicitacoes");
  if (!hasSolic) return [];

  const nameExpr = userNameExpr();

  // se users existir, faz LEFT JOIN; se não, não faz join
  const hasUsers = tableExists("users");

  const sql = hasUsers
    ? `
      SELECT
        s.id, s.titulo, s.descricao, s.setor, s.prioridade, s.status, s.created_at,
        ${nameExpr} AS criado_por
      FROM solicitacoes s
      LEFT JOIN users u ON u.id = s.created_by
      WHERE (? = 'TODOS' OR s.status = ?)
      ORDER BY s.id DESC
    `
    : `
      SELECT
        s.id, s.titulo, s.descricao, s.setor, s.prioridade, s.status, s.created_at,
        '' AS criado_por
      FROM solicitacoes s
      WHERE (? = 'TODOS' OR s.status = ?)
      ORDER BY s.id DESC
    `;

  return db.prepare(sql).all(status, status);
};

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

exports.getSolicitacaoById = (id) => {
  if (!tableExists("solicitacoes")) return null;

  const hasUsers = tableExists("users");
  const nameExpr = userNameExpr();

  const sql = hasUsers
    ? `
      SELECT
        s.*,
        ${nameExpr} AS criado_por
      FROM solicitacoes s
      LEFT JOIN users u ON u.id = s.created_by
      WHERE s.id = ?
    `
    : `
      SELECT s.*, '' AS criado_por
      FROM solicitacoes s
      WHERE s.id = ?
    `;

  return db.prepare(sql).get(id);
};

exports.listItensSolicitacao = (solicitacao_id) => {
  if (!tableExists("solicitacao_itens")) return [];
  return db
    .prepare(
      `
      SELECT id, solicitacao_id, descricao, unidade, quantidade, observacao
      FROM solicitacao_itens
      WHERE solicitacao_id = ?
      ORDER BY id ASC
    `
    )
    .all(solicitacao_id);
};

exports.addItemSolicitacao = ({ solicitacao_id, descricao, unidade, quantidade, observacao }) => {
  if (!tableExists("solicitacao_itens")) {
    throw new Error("Tabela solicitacao_itens não existe. Rode as migrations.");
  }

  const res = db
    .prepare(
      `
      INSERT INTO solicitacao_itens (solicitacao_id, descricao, unidade, quantidade, observacao)
      VALUES (?, ?, ?, ?, ?)
    `
    )
    .run(solicitacao_id, descricao, unidade || "UN", Number(quantidade || 0), observacao || null);

  return res.lastInsertRowid;
};

