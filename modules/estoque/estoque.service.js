const db = require("../../database/db");

function tableExists(name) {
  const row = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?")
    .get(name);
  return !!row;
}

function userNameExpr() {
  if (!tableExists("users")) return "''";

  const cols = db.prepare("PRAGMA table_info(users)").all().map((c) => c.name);

  if (cols.includes("nome")) return "COALESCE(u.nome,'')";
  if (cols.includes("name")) return "COALESCE(u.name,'')";
  if (cols.includes("nome_completo")) return "COALESCE(u.nome_completo,'')";
  if (cols.includes("usuario")) return "COALESCE(u.usuario,'')";
  if (cols.includes("email")) return "COALESCE(u.email,'')";
  return "''";
}

exports.listItens = () => {
  if (!tableExists("estoque")) return [];

  return db
    .prepare(
      `
      SELECT
        id, descricao, unidade, quantidade, valor_unitario, atualizado_em
      FROM estoque
      ORDER BY descricao ASC
    `
    )
    .all();
};

exports.createItem = ({ descricao, unidade, quantidade, valor_unitario }) => {
  if (!tableExists("estoque")) {
    throw new Error("Tabela estoque não existe. Rode as migrations.");
  }

  const res = db
    .prepare(
      `
      INSERT INTO estoque (descricao, unidade, quantidade, valor_unitario, atualizado_em)
      VALUES (?, ?, ?, ?, datetime('now'))
    `
    )
    .run(
      descricao,
      unidade || "UN",
      Number(quantidade || 0),
      Number(valor_unitario || 0)
    );

  return res.lastInsertRowid;
};

exports.updateItem = ({ id, descricao, unidade, quantidade, valor_unitario }) => {
  if (!tableExists("estoque")) {
    throw new Error("Tabela estoque não existe. Rode as migrations.");
  }

  db.prepare(
    `
    UPDATE estoque
    SET descricao = ?, unidade = ?, quantidade = ?, valor_unitario = ?, atualizado_em = datetime('now')
    WHERE id = ?
  `
  ).run(
    descricao,
    unidade || "UN",
    Number(quantidade || 0),
    Number(valor_unitario || 0),
    id
  );
};

exports.addMovimento = ({ item_id, tipo, quantidade, origem, created_by }) => {
  // Se você já criou estoque_mov, ótimo. Se não, só ignora o movimento sem quebrar o sistema.
  if (!tableExists("estoque_mov")) return null;

  const res = db
    .prepare(
      `
      INSERT INTO estoque_mov (item_id, tipo, quantidade, origem, created_by, created_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `
    )
    .run(item_id, tipo, Number(quantidade || 0), origem || null, created_by || null);

  return res.lastInsertRowid;
};

exports.listMovimentos = () => {
  if (!tableExists("estoque_mov")) return [];

  const hasUsers = tableExists("users");
  const nameExpr = userNameExpr();

  const sql = hasUsers
    ? `
      SELECT
        m.id, m.item_id, m.tipo, m.quantidade, m.origem, m.created_at,
        ${nameExpr} AS criado_por
      FROM estoque_mov m
      LEFT JOIN users u ON u.id = m.created_by
      ORDER BY m.id DESC
      LIMIT 200
    `
    : `
      SELECT
        m.id, m.item_id, m.tipo, m.quantidade, m.origem, m.created_at,
        '' AS criado_por
      FROM estoque_mov m
      ORDER BY m.id DESC
      LIMIT 200
    `;

  return db.prepare(sql).all();
};

