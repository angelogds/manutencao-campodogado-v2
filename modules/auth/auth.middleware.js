function requireLogin(req, res, next) {
  if (!req.session?.user) return res.redirect("/login");
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    const role = req.session?.user?.role;
    if (!role) return res.redirect("/login");
    if (roles.includes(role) || role === "ADMIN") return next();
    req.flash("error", "Sem permissão para acessar esta página.");
    return res.redirect("/dashboard");
  };
}

module.exports = { requireLogin, requireRole };
