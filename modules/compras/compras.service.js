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

// ✅ agora traz também criado_por
exports.getSolicitacao = (id) => {
  const userNameCol = hasColumn("users", "nome")
    ? "u.nome"
    : hasColumn("users", "name")
    ? "u.name"
    : "NULL";

  return db.prepare(`
    SELECT
      s.*,
      ${userNameCol} AS criado_por
    FROM solicitacoes s
    LEFT JOIN users u ON u.id = s.created_by
    WHERE s.id = ?
    LIMIT 1
  `).get(id);
};

// ✅ itens da solicitação (para “solicitação de material completa”)
exports.listItensDaSolicitacao = (solicitacao_id) => {
  return db.prepare(`
    SELECT id, descricao, unidade, quantidade, observacao
    FROM solicitacao_itens
    WHERE solicitacao_id = ?
    ORDER BY id ASC
  `).all(solicitacao_id);
};

// ✅ inserir item (vamos usar no próximo passo)
exports.addItem = ({ solicitacao_id, descricao, unidade = "UN", quantidade, observacao }) => {
  const info = db.prepare(`
    INSERT INTO solicitacao_itens (solicitacao_id, descricao, unidade, quantidade, observacao)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    solicitacao_id,
    String(descricao || "").trim(),
    String(unidade || "UN").trim().toUpperCase(),
    Number(quantidade || 0),
    observacao ? String(observacao).trim() : null
  );

  return Number(info.lastInsertRowid);
};

