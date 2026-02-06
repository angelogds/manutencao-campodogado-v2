// server.js
require("dotenv").config();
require("./database/migrate");

const express = require("express");
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");
const engine = require("ejs-mate");

const app = express();

// ✅ Railway/Proxy (resolve sessão em HTTPS atrás do proxy)
app.set("trust proxy", 1);

// ===== View engine =====
app.engine("ejs", engine);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// ===== Middlewares base =====
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// ===== Helpers de ambiente/HTTPS =====
const isProd = process.env.NODE_ENV === "production";
const isHttps = (req) => {
  // Railway normalmente envia x-forwarded-proto=https
  const xfProto = (req.headers["x-forwarded-proto"] || "").toString().toLowerCase();
  return req.secure || xfProto === "https";
};

// ===== Session + Flash (ANTES das rotas) =====
app.use(
  session({
    name: process.env.SESSION_NAME || "cgd.sid",
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
    proxy: true, // ✅ importante com proxy reverso
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: isProd, // ✅ em produção (Railway): true
      // se quiser evitar cookie eterno:
      // maxAge: 1000 * 60 * 60 * 8, // 8h
    },
  })
);

app.use(flash());

// ✅ Ajuste fino: se estiver em produção mas a requisição NÃO veio em HTTPS,
// força secure=false pra não “matar” cookie em testes/ambientes mistos.
app.use((req, _res, next) => {
  if (isProd && !isHttps(req)) {
    // se por algum motivo o proxy não marcou https, evita quebrar login
    req.session.cookie.secure = false;
  }
  next();
});

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

// ===== Guard de rotas (pra não rodar em círculos) =====
function safeUse(name, mw) {
  // router do express é uma função
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
    env: process.env.NODE_ENV || null,
    hasSession: !!req.session,
    user: req.session?.user || null,
    cookieHeader: req.headers.cookie || null,
    reqSecure: req.secure,
    xForwardedProto: req.headers["x-forwarded-proto"] || null,
    sessionCookie: req.session?.cookie || null,
  });
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
