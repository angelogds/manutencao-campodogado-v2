const db = require("../../database/db");

function hasColumn(table, column) {
  try {
    const cols = db.prepare(`PRAGMA table_info(${table})`).all();
    return cols.some((c) => c.name === column);
  } catch {
    return false;
  }
}

exports.listSolicitacoes = ({ status = "TODOS" } = {}) => {
  const where = [];
  const params = [];

  if (status && status !== "TODOS") {
    where.push("s.status = ?");
    params.push(status);
  }

  // compat: users pode ter "nome" ou "name"
  const userNameCol = hasColumn("users", "nome")
    ? "u.nome"
    : hasColumn("users", "name")
    ? "u.name"
    : "NULL";

  const sql = `
    SELECT
      s.*,
      ${userNameCol} AS criado_por
    FROM solicitacoes s
    LEFT JOIN users u ON u.id = s.created_by
    ${where.length ? "WHERE " + where.join(" AND ") : ""}
    ORDER BY s.id DESC
  `;

  return db.prepare(sql).all(...params);
};

exports.createSolicitacao = ({ titulo, setor, prioridade, descricao, created_by }) => {
  const stmt = db.prepare(`
    INSERT INTO solicitacoes (titulo, setor, prioridade, descricao, created_by)
    VALUES (?, ?, ?, ?, ?)
  `);

  const info = stmt.run(
    String(titulo || "").trim(),
    String(setor || "").trim(),
    String(prioridade || "NORMAL").trim().toUpperCase(),
    String(descricao || "").trim(),
    created_by || null
  );

  return Number(info.lastInsertRowid);
};

exports.getSolicitacao = (id) => {
  return db.prepare(`SELECT * FROM solicitacoes WHERE id = ?`).get(id);
};

// =========================
// ITENS DA SOLICITAÇÃO
// =========================
exports.listItensBySolicitacao = (solicitacao_id) => {
  return db.prepare(`
    SELECT id, solicitacao_id, descricao, unidade, quantidade, observacao
    FROM solicitacao_itens
    WHERE solicitacao_id = ?
    ORDER BY id ASC
  `).all(solicitacao_id);
};

exports.addItemSolicitacao = ({ solicitacao_id, descricao, unidade, quantidade, observacao }) => {
  const q = Number(quantidade || 0);
  if (!solicitacao_id) throw new Error("Solicitação inválida.");
  if (!String(descricao || "").trim()) throw new Error("Informe o material/especificação.");
  if (!(q > 0)) throw new Error("Quantidade inválida.");

  const info = db.prepare(`
    INSERT INTO solicitacao_itens (solicitacao_id, descricao, unidade, quantidade, observacao)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    solicitacao_id,
    String(descricao).trim(),
    String(unidade || "UN").trim().toUpperCase(),
    q,
    String(observacao || "").trim() || null
  );

  return Number(info.lastInsertRowid);
};

exports.deleteItem = (id) => {
  db.prepare(`DELETE FROM solicitacao_itens WHERE id = ?`).run(id);
};
