const morgan = require("morgan");

// Basic HTTP request logger middleware using morgan
const httpLogger = morgan("dev");

module.exports = {
  httpLogger,
};

