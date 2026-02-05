require("dotenv").config();
require("./database/migrate");

const express = require("express");
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");
const engine = require("ejs-mate");

const { requireLogin } = require("./modules/auth/auth.middleware");

// Rotas
const authRoutes = require("./modules/auth/auth.routes");
const comprasRoutes = require("./modules/compras/compras.routes");
const estoqueRoutes = require("./modules/estoque/estoque.routes");
const osRoutes = require("./modules/os/os.routes");
const usuariosRoutes = require("./modules/usuarios/usuarios.routes");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// EJS + layout()
app.engine("ejs", engine);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// estáticos
app.use(express.static(path.join(__dirname, "public")));

// Sessão (tenta SQLiteStore; se falhar, usa MemoryStore sem quebrar deploy)
let sessionOptions = {
  secret: process.env.SESSION_SECRET || "dev-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  }
};

try {
  const SQLiteStoreFactory = require("better-sqlite3-session-store");
  const db = require("./database/db");
  const SQLiteStore = SQLiteStoreFactory(session);

  sessionOptions.store = new SQLiteStore({
    client: db,
    expired: { clear: true, intervalMs: 24 * 60 * 60 * 1000 }
  });

  console.log("✅ Session store: SQLite (better-sqlite3-session-store)");
} catch (e) {
  console.log("⚠️ Session store: MemoryStore (fallback). Motivo:", e.message);
}

app.use(session(sessionOptions));
app.use(flash());

// vars globais p/ views
app.use((req, res, next) => {
  res.locals.user = req.session?.user || null;
  res.locals.flash = {
    success: req.flash("success"),
    error: req.flash("error")
  };
  next();
});

// auth primeiro
app.use(authRoutes);

// módulos
app.use(comprasRoutes);
app.use(estoqueRoutes);
app.use(osRoutes);
app.use(usuariosRoutes);

// home
app.get("/", (req, res) => {
  if (req.session?.user) return res.redirect("/dashboard");
  return res.redirect("/login");
});

// dashboard
app.get("/dashboard", requireLogin, (req, res) => {
  return res.render("dashboard/index", { title: "Dashboard" });
});

// health
app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    app: "manutencao-campo-do-gado-v2",
    timestamp: new Date().toISOString()
  });
});

// erro 404
app.use((req, res) => {
  return res.status(404).render("errors/404", { title: "Não encontrado" });
});

// erro 500 (mostra o erro real sem “rodar em círculo”)
app.use((err, req, res, _next) => {
  console.error("🔥 ERRO 500:", err);
  return res.status(500).render("errors/500", {
    title: "Erro interno",
    error: err
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Servidor ativo na porta ${port}`));
