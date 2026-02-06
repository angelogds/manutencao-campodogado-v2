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

  // ✅ compatibilidade: users pode ter "nome" ou "name"
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
