// utils/date.js
// Padrão do sistema: salvar no DB em UTC e exibir em PT-BR (America/Sao_Paulo)

const TZ = process.env.APP_TZ || "America/Sao_Paulo";

function toDate(input) {
  if (!input) return null;

  // Se vier do SQLite como "YYYY-MM-DD HH:mm:ss"
  if (typeof input === "string" && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(input)) {
    // transforma em ISO UTC
    return new Date(input.replace(" ", "T") + "Z");
  }

  // ISO normal ou Date
  const d = input instanceof Date ? input : new Date(input);
  if (isNaN(d.getTime())) return null;
  return d;
}

function fmtBR(input) {
  const d = toDate(input);
  if (!d) return "";

  const parts = new Intl.DateTimeFormat("pt-BR", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(d);

  const map = Object.fromEntries(parts.map(p => [p.type, p.value]));
  return `${map.day}/${map.month}/${map.year} ${map.hour}:${map.minute}`;
}

module.exports = { TZ, fmtBR, toDate };
