const service = require("./compras.service");

exports.index = (req, res) => {
  const items = service.list();

  return res.render("compras/index", {
    title: "Compras",
    items,
  });
};

exports.newForm = (req, res) => {
  return res.render("compras/new", {
    title: "Nova Solicitação de Compra",
  });
};

exports.create = (req, res) => {
  const { titulo, descricao, setor, prioridade } = req.body;

  if (!titulo || !descricao || !setor) {
    req.flash("error", "Preencha título, setor e descrição.");
    return res.redirect("/compras/new");
  }

  service.create({
    titulo,
    descricao,
    setor,
    prioridade: prioridade || "NORMAL",
    created_by: req.session.user.id,
  });

  req.flash("success", "Solicitação criada com sucesso.");
  return res.redirect("/compras");
};
