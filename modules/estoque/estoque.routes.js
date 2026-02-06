const express = require("express");
const router = express.Router();

const { requireLogin } = require("../auth/auth.middleware");
const controller = require("./estoque.controller"); // ✅ FALTAVA ISSO

router.get("/estoque", requireLogin, controller.index);

module.exports = router;
