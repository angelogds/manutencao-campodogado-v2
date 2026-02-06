const db = require("../../database/db");

function tableExists(name) {
  const row = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?")
    .get(name);
  return !!row;
}

exports.listItens = () => {
  if (!tableExists("estoque")) return [];

  // ✅ tua tabela estoque tem "descricao", não "nome"
  return db
    .prepare(
      `
      SELECT
        id, descricao, unidade, quantidade, valor_unitario, atualizado_em
      FROM estoque
      ORDER BY descricao COLLATE NOCASE ASC
    `
    )
    .all();
};

exports.listMovsRecentes = (limit = 20) => {
  // ✅ só lista se a tabela existir (pra não quebrar)
  if (!tableExists("estoque_mov")) return [];

  return db
    .prepare(
      `
      SELECT
        id, item_id, tipo, quantidade, origem, created_by, created_at
      FROM estoque_mov
      ORDER BY id DESC
      LIMIT ?
    `
    )
    .all(limit);
};
