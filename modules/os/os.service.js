const db = require("../../database/db");

exports.listOS = ({ status }) => {
  return db.prepare(`
    SELECT
      id, equipamento, descricao, tipo, status, custo_total,
      opened_at, closed_at, opened_by, closed_by
    FROM os
    WHERE status = ?
    ORDER BY id DESC
  `).all(status);
};

exports.createOS = ({ equipamento_id, descricao, tipo, opened_by }) => {
  const res = db.prepare(`
    INSERT INTO os (equipamento_id, descricao, tipo, status, opened_by, opened_at)
    VALUES (?, ?, ?, 'ABERTA', ?, datetime('now','-3 hours'))
  `).run(equipamento_id, descricao, tipo || "CORRETIVA", opened_by);

  return res.lastInsertRowid;
};


exports.getOSById = (id) => {
  return db.prepare(`
    SELECT
      id, equipamento, descricao, tipo, status, custo_total,
      opened_at, closed_at, opened_by, closed_by
    FROM os
    WHERE id = ?
  `).get(id);
};

exports.updateStatus = ({ id, status, userId }) => {
  const closing = status === "CONCLUIDA" || status === "CANCELADA";
  db.prepare(`
    UPDATE os
    SET status = ?,
        closed_by = CASE WHEN ? THEN ? ELSE closed_by END,
        closed_at = CASE WHEN ? THEN datetime('now') ELSE closed_at END
    WHERE id = ?
  `).run(status, closing ? 1 : 0, userId, closing ? 1 : 0, id);
};

