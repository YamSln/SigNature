const fs = require("fs");

const dbUrl = require("path").resolve(__dirname, "../db/db.json");
// DB handler, handles db connection and operations
exports.dbHandler = class dbHandler {
  constructor() {
    this.db = require(dbUrl);
  } // Returns a copy of the db object
  get dbContent() {
    return this.db;
  }
  // Write updated object to db
  updateDb(db) {
    fs.writeFile(dbUrl, JSON.stringify(db), (err) => {
      console.log(err);
    });
  }
};
