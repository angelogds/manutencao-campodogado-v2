const service = require("./compras.service");

exports.index = (req, res) => {
  const status = (req.query.status || "TODOS").toUpperCase();
  const itens = service.listSolicitacoes({ status });

  return res.render("compras/index", {
    title: "Compras",
    itens,
    status,
  });
};

exports.newForm = (req, res) => {
  return res.render("compras/new", { title: "Nova Solicitação" });
};

exports.create = (req, res) => {
  const { titulo, descricao, setor, prioridade } = req.body;

  if (!titulo || !descricao || !setor) {
    req.flash("error", "Preencha Título, Descrição e Setor.");
    return res.redirect("/compras/new");
  }

  try {
    const id = service.createSolicitacao({
      titulo,
      descricao,
      setor,
      prioridade: (prioridade || "NORMAL").toUpperCase(),
      created_by: req.session.user.id,
    });

    req.flash("success", "Solicitação criada.");
    return res.redirect(`/compras/${id}`);
  } catch (e) {
    req.flash("error", e.message || "Erro ao criar solicitação.");
    return res.redirect("/compras/new");
  }
};

exports.view = (req, res) => {
  const id = Number(req.params.id);
  const solicitacao = service.getSolicitacao(id);

  if (!solicitacao) {
    req.flash("error", "Solicitação não encontrada.");
    return res.redirect("/compras");
  }

  const itens = service.listItens(id);
  const cotacoes = service.listCotacoes(id).map((c) => ({
    ...c,
    itens: service.listCotacaoItens(c.id),
  }));

  return res.render("compras/view", {
    title: `Solicitação #${solicitacao.id}`,
    solicitacao,
    itens,
    cotacoes,
  });
};

exports.addItem = (req, res) => {
  const solicitacao_id = Number(req.params.id);
  const { descricao, unidade, quantidade, observacao } = req.body;

  if (!descricao || !quantidade) {
    req.flash("error", "Preencha descrição e quantidade.");
    return res.redirect(`/compras/${solicitacao_id}`);
  }

  try {
    service.addItem({
      solicitacao_id,
      descricao,
      unidade: unidade || "UN",
      quantidade,
      observacao,
    });
    req.flash("success", "Item adicionado.");
  } catch (e) {
    req.flash("error", e.message || "Erro ao adicionar item.");
  }

  return res.redirect(`/compras/${solicitacao_id}`);
};

exports.deleteItem = (req, res) => {
  const solicitacao_id = Number(req.params.id);
  const itemId = Number(req.params.itemId);

  try {
    service.deleteItem({ solicitacao_id, itemId });
    req.flash("success", "Item removido.");
  } catch (e) {
    req.flash("error", e.message || "Erro ao remover item.");
  }

  return res.redirect(`/compras/${solicitacao_id}`);
};

exports.addCotacao = (req, res) => {
  const solicitacao_id = Number(req.params.id);
  const { fornecedor, prazo_dias } = req.body;

  if (!fornecedor) {
    req.flash("error", "Informe o fornecedor.");
    return res.redirect(`/compras/${solicitacao_id}`);
  }

  try {
    service.createCotacao({
      solicitacao_id,
      fornecedor,
      prazo_dias: prazo_dias || 0,
      created_by: req.session.user.id,
    });

    // se estava ABERTA, vai para EM_COTACAO automaticamente
    try {
      service.setStatus({ solicitacao_id, status: "EM_COTACAO" });
    } catch (_) {}

    req.flash("success", "Cotação criada.");
  } catch (e) {
    req.flash("error", e.message || "Erro ao criar cotação.");
  }

  return res.redirect(`/compras/${solicitacao_id}`);
};

exports.addCotacaoItem = (req, res) => {
  const cotacao_id = Number(req.params.cotacaoId);
  const { solicitacao_id, descricao, unidade, quantidade, valor_unitario } = req.body;

  if (!solicitacao_id) {
    req.flash("error", "Solicitação inválida.");
    return res.redirect("/compras");
  }

  if (!descricao || !quantidade) {
    req.flash("error", "Preencha descrição e quantidade.");
    return res.redirect(`/compras/${solicitacao_id}`);
  }

  try {
    service.addCotacaoItem({
      cotacao_id,
      descricao,
      unidade: unidade || "UN",
      quantidade,
      valor_unitario: valor_unitario || 0,
    });

    req.flash("success", "Item da cotação adicionado.");
  } catch (e) {
    req.flash("error", e.message || "Erro ao adicionar item da cotação.");
  }

  return res.redirect(`/compras/${Number(solicitacao_id)}`);
};

exports.setStatus = (req, res) => {
  const solicitacao_id = Number(req.params.id);
  const { status } = req.body;

  try {
    service.setStatus({ solicitacao_id, status: (status || "").toUpperCase() });
    req.flash("success", "Status atualizado.");
  } catch (e) {
    req.flash("error", e.message || "Erro ao atualizar status.");
  }

  return res.redirect(`/compras/${solicitacao_id}`);
};

exports.receber = (req, res) => {
  const solicitacao_id = Number(req.params.id);

  try {
    service.receber({
      solicitacao_id,
      user_id: req.session.user.id,
    });

    req.flash("success", "Recebido! Estoque atualizado automaticamente.");
  } catch (e) {
    req.flash("error", e.message || "Erro ao receber solicitação.");
  }

  return res.redirect(`/compras/${solicitacao_id}`);
};
