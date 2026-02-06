const service = require("./estoque.service");

exports.index = (req, res) => {
  const itens = service.listItens();
  const movs = service.listMovsRecentes();

  return res.render("estoque/index", {
    title: "Estoque",
    itens,
    movs,
  });
};

exports.newItemForm = (req, res) => {
  return res.render("estoque/item_new", { title: "Novo Item" });
};

exports.createItem = (req, res) => {
  const { nome, unidade, estoque_min } = req.body;

  if (!nome || !unidade) {
    req.flash("error", "Preencha nome e unidade.");
    return res.redirect("/estoque/itens/new");
  }

  try {
    service.createItem({
      nome,
      unidade,
      estoque_min: Number(estoque_min || 0),
      created_by: req.session.user.id,
    });

    req.flash("success", "Item criado com sucesso.");
    return res.redirect("/estoque");
  } catch (e) {
    req.flash("error", e.message || "Erro ao criar item.");
    return res.redirect("/estoque/itens/new");
  }
};

exports.newMovForm = (req, res) => {
  const itens = service.listItens();
  return res.render("estoque/mov_new", { title: "Movimentar Estoque", itens });
};

exports.createMov = (req, res) => {
  const { item_id, tipo, quantidade, origem } = req.body;

  if (!item_id || !tipo || !quantidade) {
    req.flash("error", "Preencha item, tipo e quantidade.");
    return res.redirect("/estoque/mov/new");
  }

  try {
    service.createMov({
      item_id: Number(item_id),
      tipo,
      quantidade: Number(quantidade),
      origem: origem || null,
      created_by: req.session.user.id,
    });

    req.flash("success", "Movimentação registrada.");
    return res.redirect("/estoque");
  } catch (e) {
    req.flash("error", e.message || "Erro ao movimentar.");
    return res.redirect("/estoque/mov/new");
  }
};
