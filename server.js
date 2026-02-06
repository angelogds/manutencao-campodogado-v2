// server.js
require("dotenv").config();
require("./database/migrate");

const express = require("express");
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");
const engine = require("ejs-mate");

const app = express();

// ✅ Railway/Proxy: necessário pra cookie/sessão em HTTPS
app.set("trust proxy", 1);

// ===== View engine =====
app.engine("ejs", engine);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// ===== Middlewares base =====
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// ===== Session Store (SQLite se disponível) =====
let sessionStore = null;
try {
  const SQLiteStoreFactory = require("better-sqlite3-session-store");
  const db = require("./database/db");
  const SQLiteStore = SQLiteStoreFactory(session);
  sessionStore = new SQLiteStore({
    client: db,
    expired: { clear: true, intervalMs: 24 * 60 * 60 * 1000 },
  });
  console.log("✅ Session store: SQLite (better-sqlite3-session-store)");
} catch (e) {
  console.log("⚠️ Session store: MemoryStore (dev) — instale better-sqlite3-session-store para produção.");
}

// ===== Session + Flash (ANTES das rotas) =====
app.use(
  session({
    store: sessionStore || undefined,
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: "auto", // ✅ Railway HTTPS / Local HTTP
    },
  })
);

app.use(flash());

// ===== Globals =====
app.use((req, res, next) => {
  res.locals.user = req.session?.user || null;
  res.locals.flash = {
    success: req.flash("success"),
    error: req.flash("error"),
  };
  next();
});

// ===== Rotas (IMPORTA DEPOIS DO app criado) =====
const authRoutes = require("./modules/auth/auth.routes");
const dashboardRoutes = require("./modules/dashboard/dashboard.routes");
const comprasRoutes = require("./modules/compras/compras.routes");
const estoqueRoutes = require("./modules/estoque/estoque.routes");
const osRoutes = require("./modules/os/os.routes");
const usuariosRoutes = require("./modules/usuarios/usuarios.routes");

// ===== Guard de rotas (pra parar de rodar em círculos) =====
function safeUse(name, mw) {
  if (typeof mw !== "function") {
    console.error(`❌ ROTA/MIDDLEWARE inválido: ${name}`, typeof mw);
    throw new Error(`Middleware inválido: ${name}`);
  }
  app.use(mw);
}

safeUse("authRoutes", authRoutes);
safeUse("dashboardRoutes", dashboardRoutes);
safeUse("comprasRoutes", comprasRoutes);
safeUse("estoqueRoutes", estoqueRoutes);
safeUse("osRoutes", osRoutes);
safeUse("usuariosRoutes", usuariosRoutes);

// ===== Home =====
app.get("/", (req, res) => {
  if (req.session?.user) return res.redirect("/dashboard");
  return res.redirect("/login");
});

// ===== Health =====
app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    app: "manutencao-campo-do-gado-v2",
    timestamp: new Date().toISOString(),
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Servidor ativo na porta ${port}`));
