const service = require("./compras.service");

exports.index = (req, res) => {
  const status = req.query.status || "PENDENTE";
  const items = service.list({ status });

  return res.render("compras/index", {
    title: "Compras",
    items,
    status,
  });
};

exports.newForm = (req, res) => {
  return res.render("compras/new", { title: "Nova Solicitação" });
};

exports.create = (req, res) => {
  const { descricao, prioridade } = req.body;

  if (!descricao) {
    req.flash("error", "Informe a descrição.");
    return res.redirect("/compras/new");
  }

  try {
    const id = service.create({
      descricao,
      prioridade: prioridade || "NORMAL",
      created_by: req.session.user.id,
    });

    req.flash("success", "Solicitação criada.");
    return res.redirect("/compras");
  } catch (e) {
    req.flash("error", e.message || "Erro ao criar solicitação.");
    return res.redirect("/compras/new");
  }
};

exports.updateStatus = (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body;

  try {
    service.updateStatus({ id, status });
    req.flash("success", "Status atualizado.");
    return res.redirect("/compras");
  } catch (e) {
    req.flash("error", e.message || "Erro ao atualizar status.");
    return res.redirect("/compras");
  }
};
