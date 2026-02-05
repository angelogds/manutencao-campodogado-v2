const express = require("express");
const router = express.Router();

const { requireLogin, requireRole } = require("../auth/auth.middleware");
const controller = require("./os.controller");

router.get("/os", requireLogin, controller.list);
router.get("/os/new", requireLogin, requireRole(["MANUTENCAO", "ADMIN"]), controller.newForm);
router.post("/os", requireLogin, requireRole(["MANUTENCAO", "ADMIN"]), controller.create);

router.get("/os/:id", requireLogin, controller.view);
router.post("/os/:id/status", requireLogin, requireRole(["MANUTENCAO", "ADMIN"]), controller.changeStatus);

module.exports = router;
