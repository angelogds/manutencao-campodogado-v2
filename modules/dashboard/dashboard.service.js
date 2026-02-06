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

// Dashboard "à prova de quebra":
// se a tabela ainda não existir, retorna 0 sem explodir.
exports.getCountersSafe = () => {
  const hasOS = tableExists("os");
  const hasSolic = tableExists("solicitacoes");
  const hasCot = tableExists("cotacoes");
  const hasEstoque = tableExists("estoque");

  return {
    // ===== OS =====
    os_abertas: hasOS ? count("SELECT COUNT(*) c FROM os WHERE status='ABERTA'") : 0,
    os_andamento: hasOS ? count("SELECT COUNT(*) c FROM os WHERE status='ANDAMENTO'") : 0,
    os_concluidas: hasOS ? count("SELECT COUNT(*) c FROM os WHERE status='CONCLUIDA'") : 0,

    // ===== COMPRAS (solicitacoes + cotacoes) =====
    solicitacoes_abertas: hasSolic ? count("SELECT COUNT(*) c FROM solicitacoes WHERE status='ABERTA'") : 0,
    solicitacoes_em_cotacao: hasSolic ? count("SELECT COUNT(*) c FROM solicitacoes WHERE status='EM_COTACAO'") : 0,
    solicitacoes_aprovadas: hasSolic ? count("SELECT COUNT(*) c FROM solicitacoes WHERE status='APROVADA'") : 0,

    cotacoes_total: hasCot ? count("SELECT COUNT(*) c FROM cotacoes") : 0,

    // ===== ESTOQUE =====
    estoque_itens: hasEstoque ? count("SELECT COUNT(*) c FROM estoque") : 0,
    estoque_total_qtd: hasEstoque ? count("SELECT COALESCE(SUM(quantidade),0) c FROM estoque") : 0,
    estoque_total_valor: hasEstoque
      ? count("SELECT COALESCE(SUM(quantidade * valor_unitario),0) c FROM estoque")
      : 0,
  };
};
