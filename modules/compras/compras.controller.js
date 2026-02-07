const service = require("./compras.service");

// GET /compras
exports.index = (req, res) => {
  const status = (req.query.status || "TODOS").toUpperCase();
  const itens = service.listSolicitacoes({ status });

  return res.render("compras/index", {
    title: "Compras",
    status,
    itens,
  });
};

// GET /compras/new
exports.newForm = (_req, res) => {
  return res.render("compras/new", { title: "Nova Solicitação" });
};

// POST /compras
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

  req.flash("success", "Solicitação criada com sucesso. Agora adicione os itens.");
  return res.redirect(`/compras/${id}/itens`);
};

// GET /compras/:id
exports.view = (req, res) => {
  const id = Number(req.params.id);
  const solicitacao = service.getSolicitacao(id);

  if (!solicitacao) {
    req.flash("error", "Solicitação não encontrada.");
    return res.redirect("/compras");
  }

  const itens = service.listItensBySolicitacao(id);

  return res.render("compras/view", {
    title: `Solicitação #${solicitacao.id}`,
    solicitacao,
    itens, // ✅ IMPORTANTE (evita "itens is not defined")
  });
};

// GET /compras/:id/itens  (tela para adicionar itens)
exports.itensForm = (req, res) => {
  const id = Number(req.params.id);
  const solicitacao = service.getSolicitacao(id);

  if (!solicitacao) {
    req.flash("error", "Solicitação não encontrada.");
    return res.redirect("/compras");
  }

  const itens = service.listItensBySolicitacao(id);

  return res.render("compras/itens", {
    title: `Itens da Solicitação #${solicitacao.id}`,
    solicitacao,
    itens,
  });
};

// POST /compras/:id/itens  (adiciona item)
exports.itensCreate = (req, res) => {
  const solicitacao_id = Number(req.params.id);
  const { descricao, unidade, quantidade, observacao } = req.body;

  try {
    service.addItemSolicitacao({
      solicitacao_id,
      descricao,
      unidade,
      quantidade,
      observacao,
    });

    req.flash("success", "Item adicionado.");
    return res.redirect(`/compras/${solicitacao_id}/itens`);
  } catch (e) {
    req.flash("error", e.message || "Erro ao adicionar item.");
    return res.redirect(`/compras/${solicitacao_id}/itens`);
  }
};

// POST /compras/:id/itens/:itemId/delete  (remove item)
exports.itensDelete = (req, res) => {
  const solicitacao_id = Number(req.params.id);
  const itemId = Number(req.params.itemId);

  service.deleteItem(itemId);
  req.flash("success", "Item removido.");
  return res.redirect(`/compras/${solicitacao_id}/itens`);
};
