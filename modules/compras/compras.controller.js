const service = require("./compras.service");

exports.list = (req, res) => {
  const items = service.list();
  return res.render("compras/index", { title: "Compras", items });
};

exports.create = (req, res) => {
  const { item, qtd } = req.body;
  if (!item || !qtd) {
    req.flash("error", "Preencha item e quantidade.");
    return res.redirect("/compras");
  }
  service.create({ item, qtd: Number(qtd) });
  req.flash("success", "Solicitação criada.");
  return res.redirect("/compras");
};

exports.receive = (req, res) => {
  try {
    service.receive({ id: Number(req.params.id) });
    req.flash("success", "Compra recebida e enviada ao estoque.");
  } catch (e) {
    req.flash("error", e.message);
  }
  return res.redirect("/compras");
};
