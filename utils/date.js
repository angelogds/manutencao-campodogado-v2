const { formatBR } = require("../../utils/date");

return rows.map(r => ({
  ...r,
  created_at: formatBR(r.created_at)
}));
