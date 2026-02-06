// modules/compras/compras.service.js
const db = require("../../database/db");
const { formatBR } = require("../../utils/date");

function tableExists(name) {
  const row = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?")
    .get(name);
  return !!row;
}

function columnExists(table, column) {
  if (!tableExists(table)) return false;
  const cols = db.prepare(`PRAGMA table_info(${table})`).all();
  return cols.some((c) => c.name === column);
}

function userDisplayExpr() {
  // evita quebrar se não existir coluna "nome"
  const hasNome = columnExists("users", "nome");
  const hasName = columnExists("users", "name");
  const hasEmail = columnExists("users", "email");

  if (hasNome) return "u.nome";
  if (hasName) return "u.name";
  if (hasEmail) return "u.email";
  return "CAST(s.created_by AS TEXT)";
}

exports.listSolicitacoes = (status = "TODOS") => {
  const hasSolic = tableExists("solicitacoes");
  if (!hasSolic) return [];

  const filtro = status && status !== "TODOS" ? "WHERE s.status = ?" : "";
  const params = status && status !== "TODOS" ? [status] : [];

  const createdAtCol = columnExists("solicitacoes", "created_at")
    ? "s.created_at"
    : "NULL";

  const sql = `
    SELECT
      s.id,
      s.titulo,
      s.descricao,
      s.setor,
      s.prioridade,
      s.status,
      s.created_by,
      ${createdAtCol} AS created_at,
      ${tableExists("users") ? `(${userDisplayExpr()})` : "NULL"} AS criado_por
    FROM solicitacoes s
    ${tableExists("users") ? "LEFT JOIN users u ON u.id = s.created_by" : ""}
    ${filtro}
    ORDER BY s.id DESC
  `;

  const rows = db.prepare(sql).all(...params);

  return rows.map((r) => ({
    ...r,
    created_at: formatBR(r.created_at),
  }));
};

exports.createSolicitacao = ({ titulo, setor, prioridade, descricao, created_by }) => {
  if (!tableExists("solicitacoes")) {
    throw new Error("Tabela solicitacoes não existe. Rode as migrations.");
  }

  const stmt = db.prepare(`
    INSERT INTO solicitacoes (titulo, descricao, setor, prioridade, status, created_by)
    VALUES (?, ?, ?, ?, 'ABERTA', ?)
  `);

  const info = stmt.run(
    String(titulo || "").trim(),
    String(descricao || "").trim(),
    String(setor || "").trim(),
    String(prioridade || "NORMAL").trim(),
    created_by || null
  );

  return Number(info.lastInsertRowid);
};

exports.getSolicitacao = (id) => {
  if (!tableExists("solicitacoes")) return null;

  const createdAtCol = columnExists("solicitacoes", "created_at")
    ? "s.created_at"
    : "NULL";

  const sql = `
    SELECT
      s.*,
      ${createdAtCol} AS created_at,
      ${tableExists("users") ? `(${userDisplayExpr()})` : "NULL"} AS criado_por
    FROM solicitacoes s
    ${tableExists("users") ? "LEFT JOIN users u ON u.id = s.created_by" : ""}
    WHERE s.id = ?
    LIMIT 1
  `;

  const row = db.prepare(sql).get(id);
  if (!row) return null;

  return {
    ...row,
    created_at: formatBR(row.created_at),
  };
};
