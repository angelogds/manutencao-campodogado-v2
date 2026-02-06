const db = require("../../database/db");

// Lista itens do estoque
exports.listItens = () => {
  return db
    .prepare(
      `
    SELECT id, descricao, unidade, quantidade, valor_unitario, atualizado_em
    FROM estoque
    ORDER BY descricao ASC
  `
    )
    .all();
};

// Busca item por id
exports.getItemById = (id) => {
  return db
    .prepare(
      `
    SELECT id, descricao, unidade, quantidade, valor_unitario, atualizado_em
    FROM estoque
    WHERE id = ?
  `
    )
    .get(id);
};

// ✅ Registra movimentação + atualiza saldo do item (transação)
exports.movimentar = ({
  item_id,
  tipo,
  quantidade,
  origem,
  observacao,
  created_by,
  owner_type,
  owner_id,
}) => {
  const item = exports.getItemById(item_id);
  if (!item) throw new Error("Item de estoque não encontrado.");

  const q = Number(quantidade);
  if (!q || q <= 0) throw new Error("Quantidade inválida.");

  const upper = String(tipo || "").toUpperCase();
  if (!["ENTRADA", "SAIDA", "AJUSTE"].includes(upper)) {
    throw new Error("Tipo inválido. Use ENTRADA, SAIDA ou AJUSTE.");
  }

  // Calcula novo saldo
  let novoSaldo = Number(item.quantidade || 0);

  if (upper === "ENTRADA") novoSaldo += q;
  if (upper === "SAIDA") {
    if (novoSaldo < q) throw new Error("Saldo insuficiente para saída.");
    novoSaldo -= q;
  }
  if (upper === "AJUSTE") {
    // AJUSTE = soma positiva (ex: corrigir inventário)
    novoSaldo += q;
  }

  const tx = db.transaction(() => {
    // 1) grava movimentação
    const mov = db
      .prepare(
        `
      INSERT INTO estoque_mov (
        item_id, tipo, quantidade, origem, observacao,
        created_by, created_at, owner_type, owner_id
      )
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'), ?, ?)
    `
      )
      .run(
        item_id,
        upper,
        q,
        origem || null,
        observacao || null,
        created_by || null,
        owner_type || null,
        owner_id || null
      );

    // 2) atualiza saldo do item
    db.prepare(
      `
      UPDATE estoque
      SET quantidade = ?,
          atualizado_em = datetime('now')
      WHERE id = ?
    `
    ).run(novoSaldo, item_id);

    return mov.lastInsertRowid;
  });

  return tx();
};

// Histórico por item
exports.listMovimentosByItem = (item_id) => {
  return db
    .prepare(
      `
    SELECT
      m.id, m.tipo, m.quantidade, m.origem, m.observacao,
      m.created_at, u.name as created_by_name
    FROM estoque_mov m
    LEFT JOIN users u ON u.id = m.created_by
    WHERE m.item_id = ?
    ORDER BY m.id DESC
    LIMIT 200
  `
    )
    .all(item_id);
};
