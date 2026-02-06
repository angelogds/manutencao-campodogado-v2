const db = require("../../database/db");

// tenta suportar nomes diferentes de tabela, sem quebrar
function tableExists(name) {
  const row = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?")
    .get(name);
  return !!row;
}

function resolveItensTable() {
  if (tableExists("estoque_itens")) return "estoque_itens";
  if (tableExists("estoque")) return "estoque";
  // fallback: cria uma lista vazia sem explodir
  return null;
}

exports.listItens = () => {
  const t = resolveItensTable();
  if (!t) return [];

  // campos mínimos esperados (id, nome, unidade, saldo)
  // se seu schema for diferente, me manda que eu ajusto 1x e pronto.
  if (t === "estoque_itens") {
    return db.prepare(`
      SELECT id, nome, unidade, COALESCE(saldo, 0) AS saldo, COALESCE(estoque_min, 0) AS estoque_min
      FROM estoque_itens
      ORDER BY nome ASC
    `).all();
  }

  // tabela "estoque" genérica
  return db.prepare(`
    SELECT id, nome, unidade, COALESCE(saldo, 0) AS saldo
    FROM estoque
    ORDER BY nome ASC
  `).all();
};

exports.createItem = ({ nome, unidade, estoque_min, created_by }) => {
  const t = resolveItensTable();
  if (!t) throw new Error("Tabela de itens de estoque não encontrada (estoque_itens/estoque).");

  if (t === "estoque_itens") {
    return db.prepare(`
      INSERT INTO estoque_itens (nome, unidade, estoque_min, saldo, created_by, created_at)
      VALUES (?, ?, ?, 0, ?, datetime('now'))
    `).run(nome, unidade, estoque_min || 0, created_by);
  }

  return db.prepare(`
    INSERT INTO estoque (nome, unidade, saldo)
    VALUES (?, ?, 0)
  `).run(nome, unidade);
};

exports.listMovsRecentes = () => {
  if (!tableExists("estoque_mov")) return [];

  return db.prepare(`
    SELECT id, item_id, tipo, quantidade, origem, created_at
    FROM estoque_mov
    ORDER BY id DESC
    LIMIT 20
  `).all();
};

exports.createMov = ({ item_id, tipo, quantidade, origem, created_by }) => {
  if (!tableExists("estoque_mov")) {
    throw new Error("Tabela estoque_mov não existe. Verifique a migration 055_integracao_estoque.sql.");
  }

  const valid = ["ENTRADA", "SAIDA", "AJUSTE"];
  if (!valid.includes(tipo)) throw new Error("Tipo inválido (ENTRADA|SAIDA|AJUSTE).");
  if (!Number.isFinite(quantidade) || quantidade <= 0) throw new Error("Quantidade inválida.");

  // registra movimento
  db.prepare(`
    INSERT INTO estoque_mov (item_id, tipo, quantidade, origem, created_by, created_at)
    VALUES (?, ?, ?, ?, ?, datetime('now'))
  `).run(item_id, tipo, quantidade, origem, created_by);

  // atualiza saldo (se existir coluna saldo)
  const itensTable = resolveItensTable();
  if (!itensTable) return;

  // saldo ajustado
  let delta = quantidade;
  if (tipo === "SAIDA") delta = -quantidade;
  if (tipo === "AJUSTE") {
    // AJUSTE: define saldo = quantidade
    db.prepare(`UPDATE ${itensTable} SET saldo=? WHERE id=?`).run(quantidade, item_id);
    return;
  }

  db.prepare(`UPDATE ${itensTable} SET saldo = COALESCE(saldo,0) + ? WHERE id=?`).run(delta, item_id);
};
