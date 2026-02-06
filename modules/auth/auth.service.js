// modules/auth/auth.service.js
const db = require("../../database/db");

exports.getUserByEmail = (email) => {
  const em = String(email || "").trim().toLowerCase();

  return db
    .prepare(`
      SELECT
        id,
        COALESCE(nome, name) AS nome,
        email,
        COALESCE(role, perfil) AS role,
        password_hash
      FROM users
      WHERE lower(trim(email)) = ?
      LIMIT 1
    `)
    .get(em);
};
