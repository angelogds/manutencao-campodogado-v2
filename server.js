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

// ⚠️ se ainda NÃO existe, comente esta linha por enquanto:
// const usuariosRoutes = require("./modules/usuarios/usuarios.routes");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ✅ EJS + Layout engine
app.engine("ejs", engine);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// ✅ estáticos (CSS/JS/IMG)
app.use(express.static(path.join(__dirname, "public")));

// ✅ sessão + flash (ANTES das rotas)
app.set("trust proxy", 1); // Railway proxy
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
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

// ✅ módulos
app.use(comprasRoutes);
app.use(estoqueRoutes);
app.use(osRoutes);
// app.use(usuariosRoutes); // habilite quando o módulo existir

// ✅ home
app.get("/", (req, res) => {
  if (req.session?.user) return res.redirect("/dashboard");
  return res.redirect("/login");
});

// ✅ dashboard com layout
app.get("/dashboard", requireLogin, (req, res) => {
  return res.render("dashboard/index", {
    layout: "layout",
    title: "Dashboard",
  });
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
