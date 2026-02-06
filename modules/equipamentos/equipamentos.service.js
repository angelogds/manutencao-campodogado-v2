const db = require("../../database/db");

exports.list = ({ q, setor, status }) => {
  const where = [];
  const params = [];

  if (q) {
    where.push("(nome LIKE ? OR codigo LIKE ?)");
    params.push(`%${q}%`, `%${q}%`);
  }
  if (setor && setor !== "TODOS") {
    where.push("setor = ?");
    params.push(setor);
  }
  if (status && status !== "TODOS") {
    where.push("status = ?");
    params.push(status);
  }

  const sql = `
    SELECT id, codigo, nome, setor, localizacao, status, created_at
    FROM equipamentos
    ${where.length ? "WHERE " + where.join(" AND ") : ""}
    ORDER BY status ASC, nome ASC
  `;

  return db.prepare(sql).all(...params);
};

exports.create = ({ codigo, nome, setor, localizacao, status, observacao, created_by }) => {
  const res = db.prepare(`
    INSERT INTO equipamentos (codigo, nome, setor, localizacao, status, observacao, created_by, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now','-3 hours'))
  `).run(
    codigo || null,
    nome,
    setor,
    localizacao || null,
    status || "ATIVO",
    observacao || null,
    created_by || null
  );

  return res.lastInsertRowid;
};

exports.getById = (id) => {
  return db.prepare(`
    SELECT id, codigo, nome, setor, localizacao, status, observacao, created_at, updated_at
    FROM equipamentos
    WHERE id = ?
  `).get(id);
};

exports.update = (id, { codigo, nome, setor, localizacao, status, observacao }) => {
  db.prepare(`
    UPDATE equipamentos
    SET codigo = ?,
        nome = ?,
        setor = ?,
        localizacao = ?,
        status = ?,
        observacao = ?,
        updated_at = datetime('now','-3 hours')
    WHERE id = ?
  `).run(
    codigo || null,
    nome,
    setor,
    localizacao || null,
    status || "ATIVO",
    observacao || null,
    id
  );
};

// ✅ para usar no select da OS
exports.listAtivos = () => {
  return db.prepare(`
    SELECT id, codigo, nome, setor
    FROM equipamentos
    WHERE status = 'ATIVO'
    ORDER BY setor ASC, nome ASC
  `).all();
};
