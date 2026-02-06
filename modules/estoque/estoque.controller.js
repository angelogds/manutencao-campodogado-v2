const service = require("./estoque.service");

exports.index = (req, res) => {
  const itens = service.listItens();
  const movs = service.listMovsRecentes(15);

  return res.render("estoque/index", {
    title: "Estoque",
    itens,
    movs,
  });
};
