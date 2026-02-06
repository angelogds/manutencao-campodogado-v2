const db = require("../../database/db");

exports.listSolicitacoes = ({ status } = {}) => {
  if (status) {
    return db
      .prepare(
        `
        SELECT id, titulo, setor, prioridade, status, created_at
        FROM solicitacoes
        WHERE status = ?
        ORDER BY id DESC
      `
      )
      .all(status);
  }

  return db
    .prepare(
      `
      SELECT id, titulo, setor, prioridade, status, created_at
      FROM solicitacoes
      ORDER BY id DESC
    `
    )
    .all();
};

exports.createSolicitacao = ({ titulo, descricao, setor, prioridade, created_by, itens }) => {
  const insertSol = db.prepare(`
    INSERT INTO solicitacoes (titulo, descricao, setor, prioridade, status, created_by, created_at)
    VALUES (?, ?, ?, ?, 'ABERTA', ?, datetime('now'))
  `);

  const insertItem = db.prepare(`
    INSERT INTO solicitacao_itens (solicitacao_id, descricao, unidade, quantidade, observacao)
    VALUES (?, ?, ?, ?, ?)
  `);

  const tx = db.transaction(() => {
    const r = insertSol.run(titulo, descricao, setor, prioridade || "NORMAL", created_by);
    const solicitacaoId = r.lastInsertRowid;

    (itens || []).forEach((it) => {
      insertItem.run(
        solicitacaoId,
        it.descricao,
        it.unidade || "UN",
        Number(it.quantidade || 0),
        it.observacao || null
      );
    });

    return solicitacaoId;
  });

  return tx();
};
