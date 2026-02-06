const service = require("./compras.service");

exports.index = (req, res) => {
  const items = service.listSafe();

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
  const { descricao, prioridade } = req.body;

  if (!descricao) {
    req.flash("error", "Informe a descrição da compra.");
    return res.redirect("/compras/new");
  }

  service.create({
    descricao,
    prioridade: prioridade || "NORMAL",
    created_by: req.session.user.id,
  });

  req.flash("success", "Solicitação criada com sucesso.");
  return res.redirect("/compras");
};
