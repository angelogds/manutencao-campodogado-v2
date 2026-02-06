const db = require("../../database/db");

function tableExists(name) {
  const row = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?")
    .get(name);
  return !!row;
}

function count(sql, params = []) {
  const r = db.prepare(sql).get(...params);
  return Number(r?.c || 0);
}

exports.getCountersSafe = () => {
  const hasOS = tableExists("os");
  const hasCompras = tableExists("compras") || tableExists("solicitacoes_compra");
  const hasEstoque = tableExists("estoque_itens") || tableExists("estoque");

  return {
    os_abertas: hasOS ? count("SELECT COUNT(*) c FROM os WHERE status='ABERTA'") : 0,
    os_andamento: hasOS ? count("SELECT COUNT(*) c FROM os WHERE status='ANDAMENTO'") : 0,
    os_concluidas: hasOS ? count("SELECT COUNT(*) c FROM os WHERE status='CONCLUIDA'") : 0,

    compras_pendentes: hasCompras
      ? (
          tableExists("compras")
            ? count("SELECT COUNT(*) c FROM compras WHERE status='PENDENTE'")
            : count("SELECT COUNT(*) c FROM solicitacoes_compra WHERE status='PENDENTE'")
        )
      : 0,

    estoque_itens: hasEstoque
      ? (
          tableExists("estoque_itens")
            ? count("SELECT COUNT(*) c FROM estoque_itens")
            : count("SELECT COUNT(*) c FROM estoque")
        )
      : 0,
  };
};
