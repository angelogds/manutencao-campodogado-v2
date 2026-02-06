const TZ = process.env.APP_TZ || "America/Sao_Paulo";

// Formata datas do SQLite/ISO para pt-BR no fuso do Brasil
function fmtBR(dateLike, opts = {}) {
  if (!dateLike) return "";

  // SQLite costuma vir "YYYY-MM-DD HH:mm:ss"
  const s = String(dateLike);

  // tenta como UTC (recomendado: banco salvar UTC)
  let d = dateLike instanceof Date ? dateLike : new Date(s.replace(" ", "T") + "Z");

  // fallback
  if (isNaN(d.getTime())) d = new Date(s.replace(" ", "T"));

  const format = new Intl.DateTimeFormat("pt-BR", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    ...opts,
  });

  return format.format(d);
}

module.exports = { fmtBR, TZ };
