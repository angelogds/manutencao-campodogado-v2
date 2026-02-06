exports.list = ({ status } = {}) => {
  const t = resolveTable();
  if (!t) return [];

  if (status) {
    return db.prepare(`
      SELECT id, descricao, prioridade, status, created_at
      FROM ${t}
      WHERE UPPER(status) = UPPER(?)
      ORDER BY id DESC
    `).all(status);
  }

  return db.prepare(`
    SELECT id, descricao, prioridade, status, created_at
    FROM ${t}
    ORDER BY id DESC
  `).all();
};
