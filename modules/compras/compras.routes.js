const express = require("express");
const router = express.Router();

const { requireLogin, requireRole } = require("../auth/auth.middleware");
const controller = require("./compras.controller"); // ✅ OBRIGATÓRIO

// Lista de compras
router.get("/compras", requireLogin, controller.index);

// Nova solicitação
router.get(
  "/compras/new",
  requireLogin,
  requireRole(["ADMIN", "COMPRAS"]),
  controller.newForm
);

router.post(
  "/compras",
  requireLogin,
  requireRole(["ADMIN", "COMPRAS"]),
  controller.create
);

module.exports = router;
