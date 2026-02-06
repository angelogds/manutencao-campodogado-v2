const TZ = process.env.APP_TZ || "America/Sao_Paulo";

function fmtBR(dateLike, opts = {}) {
  if (!dateLike) return "";

  // aceita "YYYY-MM-DD HH:mm:ss" do sqlite
  let d = dateLike instanceof Date ? dateLike : new Date(String(dateLike).replace(" ", "T") + "Z");

  // se já vier Date válido, ok
  if (isNaN(d.getTime())) {
    // fallback (tenta sem Z)
    d = new Date(String(dateLike).replace(" ", "T"));
  }

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
