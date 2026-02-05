const express = require("express");
const router = express.Router();
const { requireLogin, requireRole } = require("../auth/auth.middleware");
const controller = require("./os.controller");

router.get("/os", requireLogin, controller.list);
router.get("/os/new", requireLogin, requireRole(["MANUTENCAO"]), controller.newForm);
router.post("/os", requireLogin, requireRole(["MANUTENCAO"]), controller.create);
router.get("/os/:id", requireLogin, controller.view);
router.post("/os/:id/status", requireLogin, requireRole(["MANUTENCAO"]), controller.changeStatus);

module.exports = router;
