require("dotenv").config();
require("./database/migrate");

const express = require("express");
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");

const { requireLogin } = require("./modules/auth/auth.middleware");

// Rotas
const authRoutes = require("./modules/auth/auth.routes");
const comprasRoutes = require("./modules/compras/compras.routes");
const estoqueRoutes = require("./modules/estoque/estoque.routes");
const osRoutes = require("./modules/os/os.routes");
const usuariosRoutes = require("./modules/usuarios/usuarios.routes");

const app = express();

// ✅ Railway/Proxy: necessário para cookie secure funcionar corretamente
app.set("trust proxy", 1);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// ✅ estáticos
app.use(express.static(path.join(__dirname, "public")));

// ✅ sessão + flash (ANTES das rotas)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production", // Railway
    },
  })
);

app.use(flash());

// ✅ vars globais p/ views
app.use((req, res, next) => {
  res.locals.user = req.session?.user || null;
  res.locals.flash = {
    success: req.flash("success"),
    error: req.flash("error"),
  };
  next();
});

// ✅ auth primeiro
app.use(authRoutes);

// ✅ módulos do sistema
app.use(comprasRoutes);
app.use(estoqueRoutes);
app.use(osRoutes);
app.use(usuariosRoutes);

// ✅ home
app.get("/", (req, res) => {
  if (req.session?.user) return res.redirect("/dashboard");
  return res.redirect("/login");
});

// ✅ dashboard protegido
app.get("/dashboard", requireLogin, (req, res) => {
  return res.render("dashboard/index", { title: "Dashboard" });
});

// ✅ health
app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    app: "manutencao-campo-do-gado-v2",
    timestamp: new Date().toISOString(),
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Servidor ativo na porta ${port}`));
