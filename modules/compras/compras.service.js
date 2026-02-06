const db = require("../../database/db");

exports.list = () => {
  return db.prepare(`SELECT id, item, qtd, status, created_at FROM compras ORDER BY id DESC`).all();
};

exports.create = ({ item, qtd }) => {
  const r = db.prepare(`
    INSERT INTO compras (item, qtd, status, created_at)
    VALUES (?, ?, 'PENDENTE', datetime('now'))
  `).run(item, qtd);
  return r.lastInsertRowid;
};

exports.receive = ({ id }) => {
  const compra = db.prepare(`SELECT id, item, qtd, status FROM compras WHERE id=?`).get(id);
  if (!compra) throw new Error("Compra não encontrada.");
  if (compra.status === "RECEBIDA") return;

  // marca como recebida
  db.prepare(`UPDATE compras SET status='RECEBIDA' WHERE id=?`).run(id);

  // entra no estoque (upsert simples)
  const exists = db.prepare(`SELECT id, qtd FROM estoque_itens WHERE item=?`).get(compra.item);
  if (exists) {
    db.prepare(`UPDATE estoque_itens SET qtd = qtd + ? WHERE id=?`).run(compra.qtd, exists.id);
  } else {
    db.prepare(`INSERT INTO estoque_itens (item, qtd) VALUES (?, ?)`).run(compra.item, compra.qtd);
  }
};
