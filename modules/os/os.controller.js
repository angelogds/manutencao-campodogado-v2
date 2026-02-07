// modules/os/os.controller.js
const service = require("./os.service");

// ✅ pega equipamentos para o select da OS
const equipamentosService = require("../equipamentos/equipamentos.service");

exports.list = (req, res) => {
  const status = (req.query.status || "ABERTA").toUpperCase();
  const items = service.listOS({ status });

  return res.render("os/index", {
    title: "Ordens de Serviço",
    items,
    status,
  });
};

exports.newForm = (req, res) => {
  const equipamentos = equipamentosService.listAtivos();

  return res.render("os/new", {
    title: "Abrir OS",
    equipamentos,
  });
};

exports.create = (req, res) => {
  // ✅ novo padrão: equipamento_id vindo do <select>
  // ✅ compat: se ainda vier "equipamento" texto (de um form antigo), não explode
  const { equipamento_id, equipamento, descricao, tipo } = req.body;

  const equipIdNum = equipamento_id ? Number(equipamento_id) : null;
  const tipoUp = (tipo || "CORRETIVA").toUpperCase();

  if ((!equipIdNum && !equipamento) || !descricao) {
    req.flash("error", "Selecione o equipamento e preencha a descrição.");
    return res.redirect("/os/new");
  }

  try {
    const id = service.createOS({
      equipamento_id: equipIdNum,
      equipamento: equipamento ? String(equipamento).trim() : null, // compat
      descricao: String(descricao).trim(),
      tipo: tipoUp,
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

exports.updateStatus = (req, res) => {
  const id = Number(req.params.id);
  const st = String(req.body.status || "").toUpperCase();

  const allowed = ["ABERTA", "ANDAMENTO", "PAUSADA", "CONCLUIDA", "CANCELADA"];
  if (!allowed.includes(st)) {
    req.flash("error", "Status inválido.");
    return res.redirect(`/os/${id}`);
  }

  service.updateStatus({ id, status: st, userId: req.session.user.id });
  req.flash("success", "Status atualizado.");
  return res.redirect(`/os/${id}`);
};
