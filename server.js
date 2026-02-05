require("dotenv").config();
require("./database/migrate");

const express = require("express");
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");
const engine = require("ejs-mate");

// (Opcional) Session store em SQLite — evita aviso do MemoryStore
// const SQLiteStoreFactory = require("better-sqlite3-session-store");
// const db = require("./database/db");
// const SQLiteStore = SQLiteStoreFactory(session);

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

// EJS + Layout (ejs-mate)
app.engine("ejs", engine);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// estáticos
app.use(express.static(path.join(__dirname, "public")));

// sessão + flash (ANTES das rotas)
app.use(
  session({
    // ✅ Se quiser usar SQLiteStore (recomendado no Railway), descomente o bloco do topo
    // store: new SQLiteStore({
    //   client: db,
    //   expired: { clear: true, intervalMs: 24 * 60 * 60 * 1000 }
    // }),

    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production"
    }
  })
);

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

// módulos do sistema
app.use(comprasRoutes);
app.use(estoqueRoutes);
app.use(osRoutes);
app.use(usuariosRoutes);

// home
app.get("/", (req, res) => {
  if (req.session?.user) return res.redirect("/dashboard");
  return res.redirect("/login");
});

// dashboard protegido
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

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Servidor ativo na porta ${port}`));
