const service = require("./compras.service");

exports.index = (req, res) => {
  const status = req.query.status || "TODOS";
  const itens = service.listSolicitacoes({ status });

  return res.render("compras/index", {
    title: "Compras",
    itens,     // ✅ seu EJS usa "itens"
    status,
  });
};

exports.newForm = (req, res) => {
  return res.render("compras/new", { title: "Nova Solicitação" });
};

exports.create = (req, res) => {
  const { titulo, setor, prioridade, descricao } = req.body;

  if (!titulo || !setor || !descricao) {
    req.flash("error", "Preencha Título, Setor e Descrição.");
    return res.redirect("/compras/new");
  }

  try {
    const id = service.createSolicitacao({
      titulo,
      setor,
      prioridade: prioridade || "NORMAL",
      descricao,
      created_by: req.session.user.id,
    });

    req.flash("success", "Solicitação criada com sucesso.");
    return res.redirect(`/compras/${id}`);
  } catch (e) {
    console.error("🔥 ERRO CREATE SOLICITACAO:", e);
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

  return res.render("compras/view", {
    title: `Solicitação #${solicitacao.id}`,
    solicitacao,
  });
};
