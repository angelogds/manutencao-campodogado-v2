exports.requireLogin = (req, res, next) => {
  if (req.session?.user) return next();
  req.flash("error", "Faça login para continuar.");
  return res.redirect("/login");
};

exports.requireRole = (roles = []) => {
  return (req, res, next) => {
    const role = req.session?.user?.role || req.session?.user?.perfil;
    if (!role) {
      req.flash("error", "Perfil não identificado.");
      return res.redirect("/dashboard");
    }
    if (!roles.includes(role)) {
      req.flash("error", "Acesso negado.");
      return res.redirect("/dashboard");
    }
    return next();
  };
};
