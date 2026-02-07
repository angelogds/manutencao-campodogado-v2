const express = require("express");
const router = express.Router();
const ctrl = require("./compras.controller");
const { requireLogin } = require("../auth/auth.middleware");

router.use(requireLogin);

router.get("/compras", ctrl.index);
router.get("/compras/new", ctrl.newForm);
router.post("/compras", ctrl.create);

router.get("/compras/:id", ctrl.view);

// itens
router.post("/compras/:id/itens", ctrl.addItem);
router.post("/compras/:id/itens/:itemId/delete", ctrl.removeItem);

module.exports = router;
