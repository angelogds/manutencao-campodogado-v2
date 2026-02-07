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
    String(prioridade || "NORMAL").trim(),
    String(descricao || "").trim(),
    created_by
  );

  return Number(info.lastInsertRowid);
};

exports.getSolicitacao = (id) => {
  return db.prepare(`SELECT * FROM solicitacoes WHERE id = ?`).get(id);
};

// ======================
// ITENS DA SOLICITAÇÃO
// material = descricao
// especificacao = observacao
// ======================
exports.listItensDaSolicitacao = (solicitacaoId) => {
  return db.prepare(`
    SELECT id, solicitacao_id, descricao, observacao, unidade, quantidade
    FROM solicitacao_itens
    WHERE solicitacao_id = ?
    ORDER BY id DESC
  `).all(solicitacaoId);
};

exports.addItemSolicitacao = ({ solicitacao_id, material, especificacao, quantidade, unidade = "UN" }) => {
  const stmt = db.prepare(`
    INSERT INTO solicitacao_itens (solicitacao_id, descricao, observacao, unidade, quantidade)
    VALUES (?, ?, ?, ?, ?)
  `);

  const info = stmt.run(
    Number(solicitacao_id),
    String(material || "").trim(),
    String(especificacao || "").trim(),
    String(unidade || "UN").trim(),
    Number(quantidade)
  );

  return Number(info.lastInsertRowid);
};

exports.removeItemSolicitacao = ({ itemId, solicitacaoId }) => {
  db.prepare(`
    DELETE FROM solicitacao_itens
    WHERE id = ? AND solicitacao_id = ?
  `).run(Number(itemId), Number(solicitacaoId));
};
