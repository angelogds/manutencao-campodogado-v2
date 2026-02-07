const service = require("./compras.service");

// GET /compras
exports.index = (req, res) => {
  const status = String(req.query.status || "TODOS").toUpperCase();
  const itens = service.listSolicitacoes({ status });

  return res.render("compras/index", {
    title: "Compras",
    status,
    itens,
  });
};

// GET /compras/new
exports.newForm = (_req, res) => {
  return res.render("compras/new", {
    title: "Nova Solicitação",
  });
};

// POST /compras
exports.create = (req, res) => {
  const { titulo, setor, prioridade, descricao } = req.body;
  const created_by = req.session?.user?.id || null;

  if (!titulo || !setor || !descricao) {
    req.flash("error", "Preencha Título, Setor e Descrição.");
    return res.redirect("/compras/new");
  }

  const id = service.createSolicitacao({
    titulo,
    setor,
    prioridade,
    descricao,
    created_by,
  });

  req.flash("success", "Solicitação criada com sucesso. Agora adicione os itens.");
  return res.redirect(`/compras/${id}`);
};

// GET /compras/:id
exports.view = (req, res) => {
  const id = Number(req.params.id);
  const solicitacao = service.getSolicitacao(id);

  if (!solicitacao) {
    req.flash("error", "Solicitação não encontrada.");
    return res.redirect("/compras");
  }

  const itens = service.listItensDaSolicitacao(id);

  return res.render("compras/view", {
    title: `Solicitação #${solicitacao.id}`,
    solicitacao,
    itens,
  });
};

// POST /compras/:id/itens
exports.addItem = (req, res) => {
  const solicitacao_id = Number(req.params.id);
  const { material, especificacao, quantidade, unidade } = req.body;

  if (!material || !quantidade) {
    req.flash("error", "Informe Material e Quantidade.");
    return res.redirect(`/compras/${solicitacao_id}`);
  }

  const qtdNum = Number(quantidade);
  if (!Number.isFinite(qtdNum) || qtdNum <= 0) {
    req.flash("error", "Quantidade inválida.");
    return res.redirect(`/compras/${solicitacao_id}`);
  }

  service.addItemSolicitacao({
    solicitacao_id,
    material,
    especificacao,
    quantidade: qtdNum,
    unidade: unidade || "UN",
  });

  req.flash("success", "Item adicionado.");
  return res.redirect(`/compras/${solicitacao_id}`);
};

// POST /compras/:id/itens/:itemId/delete
exports.removeItem = (req, res) => {
  const solicitacaoId = Number(req.params.id);
  const itemId = Number(req.params.itemId);

  service.removeItemSolicitacao({ itemId, solicitacaoId });

  req.flash("success", "Item removido.");
  return res.redirect(`/compras/${solicitacaoId}`);
};
