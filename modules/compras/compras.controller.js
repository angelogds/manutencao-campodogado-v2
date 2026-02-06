const service = require("./compras.service");

exports.index = (req, res) => {
  const status = req.query.status || "";
  const items = service.listSolicitacoes({ status: status || undefined });

  return res.render("compras/index", {
    title: "Compras",
    items, // ✅ padronizado: items
    status,
  });
};

exports.newForm = (req, res) => {
  return res.render("compras/new", { title: "Nova Solicitação" });
};

exports.create = (req, res) => {
  const { titulo, descricao, setor, prioridade } = req.body;

  // Itens chegam como arrays: item_descricao[], item_unidade[], item_quantidade[], item_observacao[]
  const descArr = [].concat(req.body.item_descricao || []).filter(Boolean);
  const undArr = [].concat(req.body.item_unidade || []);
  const qtdArr = [].concat(req.body.item_quantidade || []);
  const obsArr = [].concat(req.body.item_observacao || []);

  const itens = descArr.map((d, i) => ({
    descricao: d,
    unidade: undArr[i] || "UN",
    quantidade: Number(qtdArr[i] || 0),
    observacao: obsArr[i] || "",
  })).filter((x) => x.descricao && x.quantidade > 0);

  if (!titulo || !descricao || !setor) {
    req.flash("error", "Preencha título, setor e descrição.");
    return res.redirect("/compras/new");
  }

  if (itens.length === 0) {
    req.flash("error", "Adicione pelo menos 1 item com quantidade > 0.");
    return res.redirect("/compras/new");
  }

  try {
    service.createSolicitacao({
      titulo,
      descricao,
      setor,
      prioridade: prioridade || "NORMAL",
      created_by: req.session.user.id,
      itens,
    });

    req.flash("success", "Solicitação enviada para Compras.");
    return res.redirect("/compras");
  } catch (e) {
    req.flash("error", e.message || "Erro ao criar solicitação.");
    return res.redirect("/compras/new");
  }
};
