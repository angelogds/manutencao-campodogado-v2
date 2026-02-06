// utils/date.js
function formatBR(dt) {
  if (!dt) return "";
  // SQLite geralmente vem "YYYY-MM-DD HH:MM:SS"
  // Se vier ISO, também funciona (troca o T)
  return String(dt).replace("T", " ").slice(0, 19);
}

module.exports = { formatBR };
