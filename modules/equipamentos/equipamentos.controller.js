const service = require("./equipamentos.service");

exports.index = (req, res) => {
  const q = req.query.q || "";
  const setor = req.query.setor || "TODOS";
  const status = req.query.status || "TODOS";

  const itens = service.list({ q, setor, status });

  return res.render("equipamentos/index", {
    title: "Equipamentos",
    itens,
    q,
    setor,
    status,
  });
};

exports.newForm = (req, res) => {
  return res.render("equipamentos/new", { title: "Novo Equipamento" });
};

exports.create = (req, res) => {
  const { codigo, nome, setor, localizacao, status, observacao } = req.body;

  if (!nome || !setor) {
    req.flash("error", "Preencha NOME e SETOR.");
    return res.redirect("/equipamentos/new");
  }

  const id = service.create({
    codigo,
    nome,
    setor,
    localizacao,
    status,
    observacao,
    created_by: req.session.user?.id || null,
  });

  req.flash("success", "Equipamento cadastrado com sucesso.");
  return res.redirect("/equipamentos");
};

exports.editForm = (req, res) => {
  const id = Number(req.params.id);
  const item = service.getById(id);

  if (!item) {
    req.flash("error", "Equipamento não encontrado.");
    return res.redirect("/equipamentos");
  }

  return res.render("equipamentos/edit", { title: "Editar Equipamento", item });
};

exports.update = (req, res) => {
  const id = Number(req.params.id);
  const { codigo, nome, setor, localizacao, status, observacao } = req.body;

  if (!nome || !setor) {
    req.flash("error", "Preencha NOME e SETOR.");
    return res.redirect(`/equipamentos/${id}/edit`);
  }

  service.update(id, { codigo, nome, setor, localizacao, status, observacao });

  req.flash("success", "Equipamento atualizado.");
  return res.redirect("/equipamentos");
};
