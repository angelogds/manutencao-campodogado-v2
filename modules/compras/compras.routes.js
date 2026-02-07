const express = require("express");
const router = express.Router();

const { requireLogin } = require("../auth/auth.middleware");
const controller = require("./compras.controller");

router.get("/compras", requireLogin, controller.index);
router.get("/compras/new", requireLogin, controller.newForm);
router.post("/compras", requireLogin, controller.create);

router.get("/compras/:id", requireLogin, controller.view);

// ✅ ITENS
router.get("/compras/:id/itens", requireLogin, controller.itensForm);
router.post("/compras/:id/itens", requireLogin, controller.itensCreate);
router.post("/compras/:id/itens/:itemId/delete", requireLogin, controller.itensDelete);

module.exports = router;
