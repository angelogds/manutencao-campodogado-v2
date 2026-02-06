// /database/migrate.js
const fs = require("fs");
const path = require("path");
const db = require("./db");

const MIG_DIR = path.join(__dirname, "migrations");

// remove BEGIN/COMMIT caso algum arquivo tenha (evita nested transaction)
function cleanSql(sql) {
  return String(sql)
    .replace(/^\uFEFF/, "") // BOM
    .replace(/^\s*BEGIN\s*;?\s*$/gim, "")
    .replace(/^\s*BEGIN\s+TRANSACTION\s*;?\s*$/gim, "")
    .replace(/^\s*COMMIT\s*;?\s*$/gim, "")
    .replace(/^\s*END\s*;?\s*$/gim, "");
}

function ensureMigrationsTable() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL UNIQUE,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

function getAppliedSet() {
  const rows = db.prepare("SELECT filename FROM migrations").all();
  return new Set(rows.map((r) => r.filename));
}

function listSqlFiles() {
  if (!fs.existsSync(MIG_DIR)) return [];
  return fs
    .readdirSync(MIG_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort((a, b) => a.localeCompare(b)); // 001, 005, 010...
}

function applyMigrations() {
  ensureMigrationsTable();
  const applied = getAppliedSet();
  const files = listSqlFiles();

  const runAll = db.transaction(() => {
    for (const file of files) {
      if (applied.has(file)) continue;

      const full = path.join(MIG_DIR, file);
      const raw = fs.readFileSync(full, "utf-8");
      const sql = cleanSql(raw).trim();

      if (!sql) {
        db.prepare("INSERT INTO migrations (filename) VALUES (?)").run(file);
        console.log(`✔ Migration vazia marcada: ${file}`);
        continue;
      }

      db.exec(sql);

      db.prepare("INSERT INTO migrations (filename) VALUES (?)").run(file);
      console.log(`✔ Migration aplicada: ${file}`);
    }
  });

  runAll();
}

applyMigrations();
