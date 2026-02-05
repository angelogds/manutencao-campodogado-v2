const db = require("../../database/db");

exports.ensureItem = ({ nome, unidade }) => {
  const found = db.prepare(`SELECT * FROM estoque_itens WHERE lower(nome)=lower(?)`).get(nome);
  if (found) return found;

  const res = db.prepare(
    `INSERT INTO estoque_itens (nome, unidade, saldo) VALUES (?, ?, 0)`
  ).run(nome, unidade || "UN");

  return db.prepare(`SELECT * FROM estoque_itens WHERE id=?`).get(res.lastInsertRowid);
};

exports.addEntrada = ({ item_id, quantidade, origem, created_by }) => {
  db.prepare(`UPDATE estoque_itens SET saldo = saldo + ? WHERE id=?`).run(quantidade, item_id);

  db.prepare(
    `INSERT INTO estoque_mov (item_id, tipo, quantidade, origem, created_by) VALUES (?, 'ENTRADA', ?, ?, ?)`
  ).run(item_id, quantidade, origem || null, created_by || null);
};
