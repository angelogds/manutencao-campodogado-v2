// server.js
require("dotenv").config();
require("./database/migrate");

const express = require("express");
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");
const engine = require("ejs-mate");

// ✅ helper global de data/hora BR
const { fmtBR, TZ } = require("./utils/date");

const app = express();

// ✅ Railway/Proxy (resolve login que “não segura” sessão em HTTPS)
app.set("trust proxy", 1);

// ===== View engine =====
app.engine("ejs", engine);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// ===== Middlewares base =====
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// ===== Session + Flash (ANTES das rotas) =====
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: "auto",
    },
  })
);

app.use(flash());

// ===== Globals (disponível em todas as views) =====
app.locals.TZ = TZ;

app.use((req, res, next) => {
  res.locals.user = req.session?.user || null;
  res.locals.flash = {
    success: req.flash("success"),
    error: req.flash("error"),
  };

  // ✅ Disponível em TODO EJS: <%= fmtBR(data) %>
  res.locals.fmtBR = fmtBR;
  res.locals.TZ = TZ;

  next();
});

// ===== Rotas (IMPORTA DEPOIS DO app criado) =====
const authRoutes = require("./modules/auth/auth.routes");
const dashboardRoutes = require("./modules/dashboard/dashboard.routes");
const comprasRoutes = require("./modules/compras/compras.routes");
const estoqueRoutes = require("./modules/estoque/estoque.routes");
const osRoutes = require("./modules/os/os.routes");
const usuariosRoutes = require("./modules/usuarios/usuarios.routes");

// ===== Guard de rotas =====
function safeUse(name, mw) {
  if (typeof mw !== "function") {
    console.error(`❌ ROTA/MIDDLEWARE inválido: ${name}`, typeof mw, mw);
    throw new Error(`Middleware inválido: ${name}`);
  }
  app.use(mw);
}

// ✅ ordem: auth primeiro
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

// ===== Debug (remova depois) =====
app.get("/debug-session", (req, res) => {
  res.json({
    hasSession: !!req.session,
    user: req.session?.user || null,
    cookieHeader: req.headers.cookie || null,
    secure: req.secure,
    xForwardedProto: req.headers["x-forwarded-proto"] || null,
    tz: TZ,
    nowBR: fmtBR(new Date()),
  });
});

// ===== Health =====
app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    app: "manutencao-campo-do-gado-v2",
    timezone: TZ,
    timestamp_utc: new Date().toISOString(),
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Servidor ativo na porta ${port}`));
