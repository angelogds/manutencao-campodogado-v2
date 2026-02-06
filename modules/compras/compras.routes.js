const express = require("express");
const router = express.Router();

const { requireLogin } = require("../auth/auth.middleware");
const controller = require("./compras.controller");

router.get("/compras", requireLogin, controller.index);
router.get("/compras/new", requireLogin, controller.newForm);
router.post("/compras", requireLogin, controller.create);

// ✅ ESSA ROTA É O QUE TAVA QUEBRANDO DEPOIS DE CRIAR
router.get("/compras/:id", requireLogin, controller.view);

module.exports = router;
