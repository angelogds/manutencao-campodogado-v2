// modules/os/os.controller.js
const service = require("./os.service");
const equipamentosService = require("../equipamentos/equipamentos.service");

// helper: monta texto padrão do equipamento (para preencher os.equipamento NOT NULL)
function buildEquipamentoLabel(e) {
  if (!e) return "";
  const setor = e.setor ? `[${e.setor}] ` : "";
  const codigo = e.codigo ? ` - ${e.codigo}` : "";
  const nome = e.nome || e.descricao || "";
  return `${setor}${nome}${codigo}`.trim();
}

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
  const { equipamento_id, equipamento, descricao, tipo } = req.body;

  const equipIdNum = equipamento_id ? Number(equipamento_id) : null;

  if ((!equipIdNum && !String(equipamento || "").trim()) || !String(descricao || "").trim()) {
    req.flash("error", "Selecione o equipamento e preencha a descrição.");
    return res.redirect("/os/new");
  }

  try {
    // 1) Se veio equipamento_id, buscamos na base e montamos o texto padrão
    let equipamentoTxt = String(equipamento || "").trim();

    if (equipIdNum) {
      // tenta achar por métodos comuns (sem quebrar caso seu service tenha outro nome)
      let eq = null;

      if (typeof equipamentosService.getById === "function") {
        eq = equipamentosService.getById(equipIdNum);
      } else if (typeof equipamentosService.getEquipamentoById === "function") {
        eq = equipamentosService.getEquipamentoById(equipIdNum);
      } else if (typeof equipamentosService.findById === "function") {
        eq = equipamentosService.findById(equipIdNum);
      } else if (typeof equipamentosService.listAtivos === "function") {
        // fallback: procura dentro da lista
        eq = (equipamentosService.listAtivos() || []).find((x) => Number(x.id) === equipIdNum) || null;
      }

      if (!eq) {
        req.flash("error", "Equipamento selecionado não encontrado.");
        return res.redirect("/os/new");
      }

      equipamentoTxt = buildEquipamentoLabel(eq);
    }

    // 2) Cria OS garantindo equipamento (texto) NOT NULL
    const id = service.createOS({
      equipamento_id: equipIdNum || null,
      equipamento: equipamentoTxt, // ✅ garante NOT NULL
      descricao: String(descricao || "").trim(),
      tipo: String(tipo || "CORRETIVA").toUpperCase(),
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
