const db = require("../../database/db");

function tableExists(name) {
  const row = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?")
    .get(name);
  return !!row;
}

function asNumber(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

exports.listSolicitacoes = ({ status }) => {
  let where = "";
  const params = [];

  if (status && status !== "TODOS") {
    where = "WHERE s.status = ?";
    params.push(status);
  }

  return db
    .prepare(
      `
      SELECT
        s.id, s.titulo, s.setor, s.prioridade, s.status, s.created_at,
        u.nome as criado_por
      FROM solicitacoes s
      LEFT JOIN users u ON u.id = s.created_by
      ${where}
      ORDER BY s.id DESC
    `
    )
    .all(...params);
};

exports.createSolicitacao = ({ titulo, descricao, setor, prioridade, created_by }) => {
  const r = db
    .prepare(
      `
      INSERT INTO solicitacoes (titulo, descricao, setor, prioridade, status, created_by, created_at)
      VALUES (?, ?, ?, ?, 'ABERTA', ?, datetime('now'))
    `
    )
    .run(titulo, descricao, setor, prioridade || "NORMAL", created_by);

  return r.lastInsertRowid;
};

exports.getSolicitacao = (id) => {
  return db
    .prepare(
      `
      SELECT
        s.*,
        u.nome as criado_por
      FROM solicitacoes s
      LEFT JOIN users u ON u.id = s.created_by
      WHERE s.id = ?
    `
    )
    .get(id);
};

exports.listItens = (solicitacaoId) => {
  return db
    .prepare(
      `
      SELECT id, descricao, unidade, quantidade, observacao
      FROM solicitacao_itens
      WHERE solicitacao_id = ?
      ORDER BY id DESC
    `
    )
    .all(solicitacaoId);
};

exports.addItem = ({ solicitacao_id, descricao, unidade, quantidade, observacao }) => {
  const q = asNumber(quantidade, 0);
  if (q <= 0) throw new Error("Quantidade inválida.");

  const r = db
    .prepare(
      `
      INSERT INTO solicitacao_itens (solicitacao_id, descricao, unidade, quantidade, observacao)
      VALUES (?, ?, ?, ?, ?)
    `
    )
    .run(solicitacao_id, descricao, unidade || "UN", q, observacao || null);

  return r.lastInsertRowid;
};

exports.deleteItem = ({ solicitacao_id, itemId }) => {
  // garante que só apaga o item da solicitação certa
  db.prepare(`DELETE FROM solicitacao_itens WHERE id=? AND solicitacao_id=?`).run(itemId, solicitacao_id);
};

exports.listCotacoes = (solicitacaoId) => {
  return db
    .prepare(
      `
      SELECT
        c.id, c.solicitacao_id, c.fornecedor, c.prazo_dias, c.total, c.created_at,
        u.nome as criado_por
      FROM cotacoes c
      LEFT JOIN users u ON u.id = c.created_by
      WHERE c.solicitacao_id = ?
      ORDER BY c.id DESC
    `
    )
    .all(solicitacaoId);
};

exports.createCotacao = ({ solicitacao_id, fornecedor, prazo_dias, created_by }) => {
  const r = db
    .prepare(
      `
      INSERT INTO cotacoes (solicitacao_id, fornecedor, prazo_dias, total, created_by, created_at)
      VALUES (?, ?, ?, 0, ?, datetime('now'))
    `
    )
    .run(solicitacao_id, fornecedor, asNumber(prazo_dias, 0), created_by);

  return r.lastInsertRowid;
};

exports.listCotacaoItens = (cotacaoId) => {
  return db
    .prepare(
      `
      SELECT id, descricao, unidade, quantidade, valor_unitario, subtotal
      FROM cotacao_itens
      WHERE cotacao_id = ?
      ORDER BY id DESC
    `
    )
    .all(cotacaoId);
};

exports.addCotacaoItem = ({ cotacao_id, descricao, unidade, quantidade, valor_unitario }) => {
  const q = asNumber(quantidade, 0);
  const vu = asNumber(valor_unitario, 0);

  if (q <= 0) throw new Error("Quantidade inválida.");
  if (vu < 0) throw new Error("Valor unitário inválido.");

  const subtotal = q * vu;

  db.prepare(
    `
    INSERT INTO cotacao_itens (cotacao_id, descricao, unidade, quantidade, valor_unitario, subtotal)
    VALUES (?, ?, ?, ?, ?, ?)
  `
  ).run(cotacao_id, descricao, unidade || "UN", q, vu, subtotal);

  // atualiza total da cotação
  db.prepare(
    `
    UPDATE cotacoes
    SET total = (
      SELECT COALESCE(SUM(subtotal), 0)
      FROM cotacao_itens
      WHERE cotacao_id = ?
    )
    WHERE id = ?
  `
  ).run(cotacao_id, cotacao_id);
};

exports.setStatus = ({ solicitacao_id, status }) => {
  const allowed = ["ABERTA", "EM_COTACAO", "APROVADA", "REPROVADA", "COMPRADA", "RECEBIDA", "CANCELADA"];
  if (!allowed.includes(status)) throw new Error("Status inválido.");

  db.prepare(`UPDATE solicitacoes SET status=? WHERE id=?`).run(status, solicitacao_id);
};

function getBestPriceForSolicitacaoItem({ solicitacao_id, descricao }) {
  // pega um valor_unitario recente (se existir em cotacoes)
  const row = db
    .prepare(
      `
      SELECT ci.valor_unitario
      FROM cotacao_itens ci
      JOIN cotacoes c ON c.id = ci.cotacao_id
      WHERE c.solicitacao_id = ? AND ci.descricao = ?
      ORDER BY c.created_at DESC, ci.id DESC
      LIMIT 1
    `
    )
    .get(solicitacao_id, descricao);

  return row ? asNumber(row.valor_unitario, 0) : 0;
}

exports.receber = ({ solicitacao_id, user_id }) => {
  const hasMov = tableExists("estoque_mov");

  const sol = exports.getSolicitacao(solicitacao_id);
  if (!sol) throw new Error("Solicitação não encontrada.");

  const itens = exports.listItens(solicitacao_id);
  if (!itens.length) throw new Error("Não dá para receber: solicitação sem itens.");

  const tx = db.transaction(() => {
    // status RECEBIDA
    db.prepare(`UPDATE solicitacoes SET status='RECEBIDA' WHERE id=?`).run(solicitacao_id);

    for (const it of itens) {
      const desc = it.descricao.trim();
      const un = (it.unidade || "UN").trim();
      const qtd = asNumber(it.quantidade, 0);

      if (qtd <= 0) continue;

      const existing = db
        .prepare(`SELECT id, quantidade, valor_unitario FROM estoque WHERE descricao=? AND unidade=?`)
        .get(desc, un);

      const bestPrice = getBestPriceForSolicitacaoItem({ solicitacao_id, descricao: desc });
      const vu = bestPrice > 0 ? bestPrice : (existing ? asNumber(existing.valor_unitario, 0) : 0);

      if (existing) {
        db.prepare(
          `
          UPDATE estoque
          SET quantidade = quantidade + ?,
              valor_unitario = ?,
              atualizado_em = datetime('now')
          WHERE id = ?
        `
        ).run(qtd, vu, existing.id);

        if (hasMov) {
          db.prepare(
            `
            INSERT INTO estoque_mov (item_id, tipo, quantidade, origem, created_by, created_at)
            VALUES (?, 'ENTRADA', ?, ?, ?, datetime('now'))
          `
          ).run(existing.id, qtd, `SOLICITACAO #${solicitacao_id}`, user_id);
        }
      } else {
        const r = db.prepare(
          `
          INSERT INTO estoque (descricao, unidade, quantidade, valor_unitario, atualizado_em)
          VALUES (?, ?, ?, ?, datetime('now'))
        `
        ).run(desc, un, qtd, vu);

        if (hasMov) {
          db.prepare(
            `
            INSERT INTO estoque_mov (item_id, tipo, quantidade, origem, created_by, created_at)
            VALUES (?, 'ENTRADA', ?, ?, ?, datetime('now'))
          `
          ).run(r.lastInsertRowid, qtd, `SOLICITACAO #${solicitacao_id}`, user_id);
        }
      }
    }
  });

  tx();
};
