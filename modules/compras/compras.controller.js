const service = require("./compras.service");

exports.index = (req, res) => {
  const itens = service.list();

  return res.render("compras/index", {
    title: "Compras",
    itens,
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

  try {
    service.create({
      descricao,
      prioridade: prioridade || "NORMAL",
      created_by: req.session.user.id,
    });

    req.flash("success", "Solicitação de compra criada.");
    return res.redirect("/compras");
  } catch (e) {
    req.flash("error", e.message || "Erro ao criar solicitação.");
    return res.redirect("/compras/new");
  }
};
