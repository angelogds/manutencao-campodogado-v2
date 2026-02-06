const service = require("./compras.service");

// GET /compras
exports.index = (req, res) => {
  try {
    const status = req.query.status || "ABERTA";
    const itens = service.listSolicitacoes({ status }); // ✅ nome que a VIEW espera

    return res.render("compras/index", {
      title: "Compras",
      status,
      itens, // ✅ agora existe
    });
  } catch (e) {
    console.error("🔥 ERRO /compras:", e);
    req.flash("error", e.message || "Erro ao abrir Compras.");
    return res.redirect("/dashboard");
  }
};

// GET /compras/new
exports.newForm = (req, res) => {
  return res.render("compras/new", { title: "Nova Solicitação" });
};

// POST /compras
exports.create = (req, res) => {
  try {
    const { titulo, descricao, setor, prioridade } = req.body;

    if (!titulo || !descricao || !setor) {
      req.flash("error", "Preencha título, setor e descrição.");
      return res.redirect("/compras/new");
    }

    const id = service.createSolicitacao({
      titulo,
      descricao,
      setor,
      prioridade: prioridade || "NORMAL",
      created_by: req.session.user.id,
    });

    req.flash("success", "Solicitação criada com sucesso.");
    return res.redirect("/compras");
  } catch (e) {
    console.error("🔥 ERRO POST /compras:", e);
    req.flash("error", e.message || "Erro ao criar solicitação.");
    return res.redirect("/compras/new");
  }
};
