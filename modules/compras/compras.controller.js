// modules/compras/compras.controller.js
const service = require("./compras.service");

exports.index = (req, res) => {
  const status = (req.query.status || "TODOS").toString();
  const itens = service.listSolicitacoes(status);

  return res.render("compras/index", {
    title: "Compras",
    itens,   // ✅ seu index.ejs usa "itens"
    status,
  });
};

exports.newForm = (req, res) => {
  return res.render("compras/new", {
    title: "Nova Solicitação",
  });
};

exports.create = (req, res) => {
  const { titulo, setor, prioridade, descricao } = req.body;

  const created_by = req.session?.user?.id || null;

  const id = service.createSolicitacao({
    titulo,
    setor,
    prioridade,
    descricao,
    created_by,
  });

  req.flash("success", "Solicitação criada com sucesso.");
  return res.redirect(`/compras/${id}`);
};

exports.view = (req, res) => {
  const id = Number(req.params.id);
  const item = service.getSolicitacao(id);

  if (!item) {
    req.flash("error", "Solicitação não encontrada.");
    return res.redirect("/compras");
  }

  return res.render("compras/view", {
    title: `Solicitação #${item.id}`,
    item,
  });
};
