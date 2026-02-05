// modules/dashboard/dashboard.service.js
const db = require("../../database/db");

function tableExists(name) {
  const row = db
    .prepare(
      `SELECT name FROM sqlite_master WHERE type='table' AND name = ?`
    )
    .get(name);
  return !!row;
}

function safeCount(sql, params = []) {
  try {
    return db.prepare(sql).get(...params)?.c ?? 0;
  } catch {
    return 0;
  }
}

exports.getCounters = () => {
  const hasOS = tableExists("os");
  const hasSolic = tableExists("solicitacoes");
  const hasCot = tableExists("cotacoes");
  const hasEstoque = tableExists("estoque");

  const counters = {
    os_abertas: hasOS
      ? safeCount(`SELECT COUNT(*) as c FROM os WHERE status = 'ABERTA'`)
      : 0,
    os_andamento: hasOS
      ? safeCount(`SELECT COUNT(*) as c FROM os WHERE status = 'ANDAMENTO'`)
      : 0,
    os_concluidas: hasOS
      ? safeCount(`SELECT COUNT(*) as c FROM os WHERE status = 'CONCLUIDA'`)
      : 0,

    solicitacoes_pendentes: hasSolic
      ? safeCount(
          `SELECT COUNT(*) as c FROM solicitacoes WHERE status IN ('ABERTA','PENDENTE','EM_COTACAO')`
        )
      : 0,

    cotacoes_total: hasCot
      ? safeCount(`SELECT COUNT(*) as c FROM cotacoes`)
      : 0,

    itens_estoque: hasEstoque
      ? safeCount(`SELECT COUNT(*) as c FROM estoque`)
      : 0,
  };

  return counters;
};
