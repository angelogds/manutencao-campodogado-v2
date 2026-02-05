const service = require("./os.service");

exports.list = (req, res) => {
  const status = req.query.status || "ABERTA";
  const items = service.listOS({ status });

  return res.render("os/index", {
    title: "Ordens de Serviço",
    items,
    status,
  });
};

exports.newForm = (req, res) => {
  return res.render("os/new", { title: "Abrir OS" });
};

exports.create = (req, res) => {
  const { equipamento, descricao, tipo } = req.body;

  if (!equipamento || !descricao) {
    req.flash("error", "Preencha equipamento e descrição.");
    return res.redirect("/os/new");
  }

  try {
    const id = service.createOS({
      equipamento,
      descricao,
      tipo: tipo || "CORRETIVA",
      opened_by: req.session.user.id,
    });

    req.flash("success", "OS aberta com sucesso.");
    return res.redirect(`/os/${id}`);
  } catch (e) {
    req.flash("error", e.message || "Erro ao abrir OS.");
    return res.redirect("/os/new");
  }
};

exports.view = (req, res) => {
  const id = Number(req.params.id);
  const os = service.getOSById(id);

  if (!os) {
    req.flash("error", "OS não encontrada.");
    return res.redirect("/os");
  }

  return res.render("os/view", { title: `OS #${os.id}`, os });
};

exports.changeStatus = (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body;

  try {
    service.updateStatus({ id, status, closed_by: req.session.user.id });
    req.flash("success", "Status atualizado.");
    return res.redirect(`/os/${id}`);
  } catch (e) {
    req.flash("error", e.message || "Erro ao atualizar status.");
    return res.redirect(`/os/${id}`);
  }
};
