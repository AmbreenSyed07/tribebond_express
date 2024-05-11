const path = require("path");
const rootPath = path.normalize(__dirname + "/..");
const env = process.env.NODE_ENV || "development";

const config = {
  development: {
    root: rootPath,
    app: {
      name: "tribebond",
    },
    port: process.env.PORT || 8713,
    db: "mongodb://localhost:27017/tribebond-development",
  },

  test: {
    root: rootPath,
    app: {
      name: "tribebond",
    },
    port: process.env.PORT || 8713,
    db: "mongodb://localhost:27017/tribebond-test",
  },

  production: {
    root: rootPath,
    app: {
      name: "tribebond",
    },
    port: process.env.PORT || 8713,
    db: "mongodb://localhost:27017/tribebond-production",
  },
};

module.exports = config[env];
