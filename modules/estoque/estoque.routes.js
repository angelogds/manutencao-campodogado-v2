const express = require("express");
const router = express.Router();

const { requireLogin, requireRole } = require("../auth/auth.middleware");
const { ROLES } = require("../../utils/security/permissions");

router.get(
  "/estoque",
  requireLogin,
  requireRole([ROLES.ADMIN, ROLES.COMPRAS, ROLES.DIRECAO]),
  (req, res) => res.render("estoque/index", { title: "Estoque" })
);

router.get("/estoque", requireLogin, controller.index);
router.get("/estoque/:id", requireLogin, controller.viewItem);
router.get("/estoque/:id/mov", requireLogin, controller.movForm);
router.post("/estoque/:id/mov", requireLogin, controller.movPost);

module.exports = router;

