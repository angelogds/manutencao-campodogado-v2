const db = require("../../database/db");

exports.listOS = ({ status }) => {
  return db.prepare(`
    SELECT
      id, equipamento_id, equipamento, descricao, tipo, status, custo_total,
      opened_at, closed_at, opened_by, closed_by
    FROM os
    WHERE status = ?
    ORDER BY id DESC
  `).all(status);
};

exports.createOS = ({ equipamento_id, equipamento, descricao, tipo, opened_by }) => {
  let equipamentoTxt = equipamento ? String(equipamento).trim() : null;

  // ✅ Se veio equipamento_id mas não veio texto, buscamos na tabela equipamentos
  if (!equipamentoTxt && equipamento_id) {
    const eq = db.prepare(`
      SELECT id, nome, setor, codigo
      FROM equipamentos
      WHERE id = ?
      LIMIT 1
    `).get(equipamento_id);

    if (!eq) throw new Error("Equipamento não encontrado.");

    equipamentoTxt =
      `[${eq.setor}] ${eq.nome}` + (eq.codigo ? ` - ${eq.codigo}` : "");
  }

  if (!equipamentoTxt) {
    // ainda protege caso venha tudo vazio
    throw new Error("Informe o equipamento.");
  }

  const res = db.prepare(`
    INSERT INTO os (equipamento_id, equipamento, descricao, tipo, status, opened_by, opened_at)
    VALUES (?, ?, ?, ?, 'ABERTA', ?, datetime('now','-3 hours'))
  `).run(
    equipamento_id || null,
    equipamentoTxt,
    descricao,
    (tipo || "CORRETIVA").toUpperCase(),
    opened_by
  );

  return res.lastInsertRowid;
};

exports.getOSById = (id) => {
  return db.prepare(`
    SELECT
      id, equipamento_id, equipamento, descricao, tipo, status, custo_total,
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
        closed_at = CASE WHEN ? THEN datetime('now','-3 hours') ELSE closed_at END
    WHERE id = ?
  `).run(status, closing ? 1 : 0, userId, closing ? 1 : 0, id);
};
