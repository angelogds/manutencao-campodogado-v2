require("dotenv").config();
require("./database/migrate");

const express = require("express");
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");

// ✅ Store de sessão persistente (SQLite) - evita warning do MemoryStore no Railway
const SQLiteStoreFactory = require("better-sqlite3-session-store");
const SQLiteStore = SQLiteStoreFactory(session);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// ✅ Sessão e flash precisam vir ANTES das rotas
app.use(
  session({
    store: new SQLiteStore({
      client: require("./database/db"), // usa seu db.js
      expired: {
        clear: true,
        intervalMs: 15 * 60 * 1000, // limpa expiradas a cada 15 min
      },
    }),
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 12, // 12h
    },
  })
);

app.use(flash());

// ✅ Variáveis globais para as views (EJS)
app.use((req, res, next) => {
  res.locals.user = req.session?.user || null;
  res.locals.flash = {
    success: req.flash("success"),
    error: req.flash("error"),
  };
  next();
});

// ✅ Rota principal do sistema
app.get("/", (req, res) => {
  if (req.session?.user) return res.redirect("/dashboard");
  return res.redirect("/login");
});

// ✅ Health check (Railway)
app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    app: "manutencao-campo-do-gado-v2",
    timestamp: new Date().toISOString(),
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor ativo na porta ${port}`);
});
