const express = require("express");
const router = express.Router();

const { requireLogin, requireRole } = require("../auth/auth.middleware");
const controller = require("./estoque.controller"); // ✅ FALTAVA ISSO

// Estoque (visão geral)
router.get("/estoque", requireLogin, controller.index);

// Itens
router.get("/estoque/itens/new", requireLogin, requireRole(["ADMIN", "COMPRAS"]), controller.newItemForm);
router.post("/estoque/itens", requireLogin, requireRole(["ADMIN", "COMPRAS"]), controller.createItem);

// Movimentações (ENTRADA/SAÍDA/AJUSTE)
router.get("/estoque/mov/new", requireLogin, requireRole(["ADMIN", "COMPRAS", "MANUTENCAO"]), controller.newMovForm);
router.post("/estoque/mov", requireLogin, requireRole(["ADMIN", "COMPRAS", "MANUTENCAO"]), controller.createMov);

module.exports = router;
