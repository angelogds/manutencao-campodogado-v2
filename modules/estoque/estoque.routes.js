const express = require("express");
const router = express.Router();

const { requireLogin } = require("../auth/auth.middleware");
const controller = require("./estoque.controller"); // ✅ tava faltando isso em algum momento

router.get("/estoque", requireLogin, controller.index);

module.exports = router;
