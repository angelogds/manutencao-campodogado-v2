const express = require("express");
const router = express.Router();

const { requireLogin, requireRole } = require("../auth/auth.middleware");
const controller = require("./compras.controller");

// Lista / criação
router.get("/compras", requireLogin, controller.index);
router.get("/compras/new", requireLogin, controller.newForm);
router.post("/compras", requireLogin, controller.create);

// Detalhe
router.get("/compras/:id", requireLogin, controller.view);

// Itens da solicitação
router.post("/compras/:id/itens", requireLogin, controller.addItem);
router.post("/compras/:id/itens/:itemId/delete", requireLogin, controller.deleteItem);

// Cotações
router.post("/compras/:id/cotacoes", requireLogin, requireRole(["ADMIN", "COMPRAS"]), controller.addCotacao);
router.post("/compras/cotacoes/:cotacaoId/itens", requireLogin, requireRole(["ADMIN", "COMPRAS"]), controller.addCotacaoItem);

// Status
router.post("/compras/:id/status", requireLogin, requireRole(["ADMIN", "COMPRAS"]), controller.setStatus);

// Receber (gera entrada no estoque)
router.post("/compras/:id/receber", requireLogin, requireRole(["ADMIN", "COMPRAS"]), controller.receber);

module.exports = router;
