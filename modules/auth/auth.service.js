// modules/auth/auth.service.js
const db = require("../../database/db");

function getUsersColumns() {
  const rows = db.prepare("PRAGMA table_info(users)").all();
  return new Set(rows.map(r => r.name));
}

exports.getUserByEmail = (email) => {
  const em = String(email || "").trim().toLowerCase();
  const cols = getUsersColumns();

  const colNome = cols.has("nome") ? "nome" : (cols.has("name") ? "name" : "email");
  const colRole = cols.has("role") ? "role" : (cols.has("perfil") ? "perfil" : "'USER'");

  const sql = `
    SELECT
      id,
      ${colNome} AS nome,
      email,
      ${colRole} AS role,
      password_hash
    FROM users
    WHERE lower(trim(email)) = ?
    LIMIT 1
  `;

  return db.prepare(sql).get(em);
};
