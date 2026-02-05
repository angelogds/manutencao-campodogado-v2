const express = require("express");
const router = express.Router();

const { requireLogin, requireRole } = require("../auth/auth.middleware");
const { ROLES } = require("../../utils/security/permissions");

// ✅ ADMIN - tela de usuários (placeholder por enquanto)
router.get(
  "/admin/users",
  requireLogin,
  requireRole([ROLES.ADMIN]),
  (req, res) => {
    return res.render("admin/users", { title: "Usuários" });
  }
);

module.exports = router;
