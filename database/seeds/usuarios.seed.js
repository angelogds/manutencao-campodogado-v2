const bcrypt = require("bcryptjs");
const db = require("../db");

const email = "admin@campodogado.local";
const senha = "admin123";

const exists = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
if (!exists) {
  const hash = bcrypt.hashSync(senha, 10);
  db.prepare(`
    INSERT INTO users (name, email, password_hash, role, created_at)
    VALUES (?, ?, ?, ?, datetime('now'))
  `).run("Admin", email, hash, "ADMIN");
  console.log("✅ Admin criado:", email);
} else {
  console.log("ℹ️ Admin já existe:", email);
}
