const express = require("express");
const router = express.Router();
const { requireLogin, requireRole } = require("../auth/auth.middleware");
const controller = require("./compras.controller");

router.get("/compras", requireLogin, requireRole(["ADMIN","COMPRAS"]), controller.list);
router.post("/compras", requireLogin, requireRole(["ADMIN","COMPRAS"]), controller.create);

// receber compra -> joga no estoque
router.post("/compras/:id/receber", requireLogin, requireRole(["ADMIN","COMPRAS"]), controller.receive);

module.exports = router;
