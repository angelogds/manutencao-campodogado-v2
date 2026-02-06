// database/seed.js
const bcrypt = require("bcryptjs");
const db = require("./db");

function getCols(table) {
  const rows = db.prepare(`PRAGMA table_info(${table})`).all();
  return new Set(rows.map(r => r.name));
}

function ensureAdmin() {
  const cols = getCols("users");

  // nomes de colunas compatíveis (caso você tenha mudado algo)
  const colName = cols.has("name") ? "name" : (cols.has("nome") ? "nome" : null);
  const colEmail = cols.has("email") ? "email" : null;
  const colRole = cols.has("role") ? "role" : (cols.has("perfil") ? "perfil" : null);
  const colPass = cols.has("password_hash") ? "password_hash" : (cols.has("senha_hash") ? "senha_hash" : null);

  if (!colName || !colEmail || !colRole || !colPass) {
    console.error("❌ Tabela users sem colunas esperadas:", Array.from(cols));
    return;
  }

  const email = "admin@campodogado.local";
  const exists = db
    .prepare(`SELECT id FROM users WHERE lower(trim(${colEmail})) = ? LIMIT 1`)
    .get(email);

  if (exists) {
    console.log("✔ Seed: admin já existe");
    return;
  }

  const hash = bcrypt.hashSync("admin123", 10);

  db.prepare(`
    INSERT INTO users (${colName}, ${colEmail}, ${colRole}, ${colPass})
    VALUES (?, ?, ?, ?)
  `).run("Administrador", email, "ADMIN", hash);

  console.log("✔ Seed: admin criado (admin@campodogado.local / admin123)");
}

module.exports = { ensureAdmin };
