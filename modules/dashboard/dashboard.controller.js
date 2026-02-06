const service = require("./dashboard.service");

exports.index = (req, res) => {
  const counters = service.getCountersSafe();

  return res.render("dashboard/index", {
    title: "Dashboard",
    counters,
  });
};
