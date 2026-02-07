const db = require("../../database/db");

exports.listOS = ({ status }) => {
  return db
    .prepare(`
      SELECT
        id, equipamento_id, equipamento, descricao, tipo, status, custo_total,
        opened_at, closed_at, opened_by, closed_by
      FROM os
      WHERE status = ?
      ORDER BY id DESC
    `)
    .all(status);
};

exports.createOS = ({ equipamento_id, equipamento, descricao, tipo, opened_by }) => {
  const equipamentoTxt = String(equipamento || "").trim();
  const descricaoTxt = String(descricao || "").trim();

  if (!equipamentoTxt) {
    throw new Error("Informe o equipamento.");
  }
  if (!descricaoTxt) {
    throw new Error("Informe a descrição.");
  }

  const info = db
    .prepare(`
      INSERT INTO os (
        equipamento_id, equipamento, descricao, tipo, status, opened_by, opened_at
      )
      VALUES (?, ?, ?, ?, 'ABERTA', ?, datetime('now','-3 hours'))
    `)
    .run(
      equipamento_id ? Number(equipamento_id) : null,
      equipamentoTxt,
      descricaoTxt,
      String(tipo || "CORRETIVA").toUpperCase(),
      opened_by
    );

  return Number(info.lastInsertRowid);
};

exports.getOSById = (id) => {
  return db
    .prepare(`
      SELECT
        id, equipamento_id, equipamento, descricao, tipo, status, custo_total,
        opened_at, closed_at, opened_by, closed_by
      FROM os
      WHERE id = ?
    `)
    .get(id);
};

exports.updateStatus = ({ id, status, userId }) => {
  const st = String(status || "").toUpperCase();
  const closing = st === "CONCLUIDA" || st === "CANCELADA";

  db.prepare(`
    UPDATE os
    SET status = ?,
        closed_by = CASE WHEN ? THEN ? ELSE closed_by END,
        closed_at = CASE WHEN ? THEN datetime('now','-3 hours') ELSE closed_at END
    WHERE id = ?
  `).run(st, closing ? 1 : 0, userId, closing ? 1 : 0, id);
};
