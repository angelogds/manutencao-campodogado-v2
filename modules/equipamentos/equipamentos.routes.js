const express = require("express");
const router = express.Router();

const { requireLogin, requireRole } = require("../auth/auth.middleware");
const controller = require("./equipamentos.controller");

// LISTA
router.get("/equipamentos", requireLogin, controller.index);

// NOVO
router.get(
  "/equipamentos/new",
  requireLogin,
  requireRole(["ADMIN", "MANUTENCAO"]),
  controller.newForm
);

router.post(
  "/equipamentos",
  requireLogin,
  requireRole(["ADMIN", "MANUTENCAO"]),
  controller.create
);

// EDITAR
router.get(
  "/equipamentos/:id/edit",
  requireLogin,
  requireRole(["ADMIN", "MANUTENCAO"]),
  controller.editForm
);

router.post(
  "/equipamentos/:id",
  requireLogin,
  requireRole(["ADMIN", "MANUTENCAO"]),
  controller.update
);

module.exports = router;
