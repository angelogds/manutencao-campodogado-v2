const db = require("../../database/db");

function tableExists(name) {
  const row = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?")
    .get(name);
 const { formatBR } = require("../../utils/date");

return rows.map(r => ({
  ...r,
  created_at: formatBR(r.created_at)
}));

exports.listSolicitacoes = ({ status } = {}) => {
  if (!tableExists("solicitacoes")) return [];

  // status opcional
  if (status && status !== "TODOS") {
    return db.prepare(`
      SELECT
        s.id, s.titulo, s.setor, s.prioridade, s.status, s.created_at
      FROM solicitacoes s
      ORDER BY s.id DESC
    `).all().filter((x) => x.status === status);
  }

  return db.prepare(`
    SELECT
      s.id, s.titulo, s.setor, s.prioridade, s.status, s.created_at
    FROM solicitacoes s
    ORDER BY s.id DESC
  `).all();
};

exports.createSolicitacao = ({ titulo, setor, prioridade, descricao, created_by }) => {
  if (!tableExists("solicitacoes")) throw new Error("Tabela solicitacoes não existe.");

  const res = db.prepare(`
    INSERT INTO solicitacoes (titulo, descricao, setor, prioridade, status, created_by, created_at)
    VALUES (?, ?, ?, ?, 'ABERTA', ?, datetime('now'))
  `).run(titulo, descricao, setor, prioridade, created_by);

  return Number(res.lastInsertRowid);
};

exports.getSolicitacao = (id) => {
  if (!tableExists("solicitacoes")) return null;

  return db.prepare(`
    SELECT
      s.id, s.titulo, s.descricao, s.setor, s.prioridade, s.status, s.created_by, s.created_at
    FROM solicitacoes s
    WHERE s.id = ?
  `).get(id);
};

