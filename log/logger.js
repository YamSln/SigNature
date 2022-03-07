const { Console } = require("console");
const fs = require("fs");
require("dotenv").config();
const logFileLocation =
  process.env.ENV == "dev" ? "./log/debug.log" : "debug.log";
exports.Logger = class Logger {
  constructor() {
    this.logger = new Console(
      fs.createWriteStream(logFileLocation, { flags: "a" })
    );
  }

  log(message, location) {
    this.logger.log(this._getLog("LOG", message, location));
  }

  error(message, location) {
    this.logger.error(this._getLog("ERROR", message, location));
  }

  warn(message, location) {
    this.logger.warn(this._getLog("WARN", message, location));
  }

  info(message, location) {
    this.logger.info(this._getLog("INFO", message, location));
  }

  _getTime() {
    const date = new Date();
    return (
      date.getFullYear() +
      "-" +
      (date.getMonth() + 1) +
      "-" +
      date.getDate() +
      " " +
      date.getHours() +
      ":" +
      date.getMinutes() +
      ":" +
      date.getSeconds()
    );
  }

  _getLog(type, message, location) {
    return (
      this._getTime() + " " + type + " | " + (location || "") + ": " + message
    );
  }
};
