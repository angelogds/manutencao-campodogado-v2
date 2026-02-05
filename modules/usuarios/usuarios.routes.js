const express = require("express");
const router = express.Router();

const { requireLogin, requireRole } = require("../auth/auth.middleware");
const controller = require("./usuarios.controller");

router.get("/admin/users", requireLogin, requireRole(["ADMIN"]), controller.list);

module.exports = router;
