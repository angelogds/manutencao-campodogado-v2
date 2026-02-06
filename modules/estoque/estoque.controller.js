const service = require("./estoque.service");

exports.index = (req, res) => {
  const itens = service.listItens();
  return res.render("estoque/index", { title: "Estoque", itens });
};

exports.viewItem = (req, res) => {
  const id = Number(req.params.id);
  const item = service.getItemById(id);

  if (!item) {
    req.flash("error", "Item não encontrado.");
    return res.redirect("/estoque");
  }

  const movimentos = service.listMovimentosByItem(id);

  return res.render("estoque/view", {
    title: `Estoque • ${item.descricao}`,
    item,
    movimentos,
  });
};

exports.movForm = (req, res) => {
  const id = Number(req.params.id);
  const item = service.getItemById(id);

  if (!item) {
    req.flash("error", "Item não encontrado.");
    return res.redirect("/estoque");
  }

  return res.render("estoque/mov", {
    title: "Movimentar Estoque",
    item,
  });
};

exports.movPost = (req, res) => {
  const id = Number(req.params.id);
  const item = service.getItemById(id);

  if (!item) {
    req.flash("error", "Item não encontrado.");
    return res.redirect("/estoque");
  }

  const { tipo, quantidade, origem, observacao } = req.body;

  try {
    service.movimentar({
      item_id: id,
      tipo,
      quantidade,
      origem,
      observacao,
      created_by: req.session.user.id,
      owner_type: "manual",
      owner_id: null,
    });

    req.flash("success", "Movimentação registrada e saldo atualizado.");
    return res.redirect(`/estoque/${id}`);
  } catch (e) {
    req.flash("error", e.message || "Erro ao movimentar estoque.");
    return res.redirect(`/estoque/${id}/mov`);
  }
};
