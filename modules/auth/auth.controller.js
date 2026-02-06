// modules/auth/auth.controller.js
const bcrypt = require("bcryptjs");
const authService = require("./auth.service");

exports.showLogin = (req, res) => {
  if (req.session.user) return res.redirect("/dashboard");
  return res.render("auth/login", { title: "Login" });
};

exports.doLogin = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    req.flash("error", "Informe email e senha.");
    return res.redirect("/login");
  }

  const user = authService.getUserByEmail(email);

  if (!user) {
    req.flash("error", "Usuário não encontrado.");
    return res.redirect("/login");
  }

  const ok = bcrypt.compareSync(password, user.password_hash || "");
  if (!ok) {
    req.flash("error", "Senha inválida.");
    return res.redirect("/login");
  }

  req.session.user = {
    id: user.id,
    nome: user.nome || "Usuário",
    email: user.email,
    role: user.role || "USER",
  };

  req.session.save(() => res.redirect("/dashboard"));
};

exports.logout = (req, res) => {
  req.session.destroy(() => res.redirect("/login"));
};
