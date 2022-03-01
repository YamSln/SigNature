const fs = require("fs");

const dbUrl = "./db/db.json";

exports.dbHandler = class dbHandler {
  constructor() {
    this.db = require(dbUrl);
  }
  get dbContent() {
    return this.db;
  }

  updateDb(db) {
    fs.writeFileSync(dbUrl, JSON.stringify(db), (err) => {
      console.log(err);
    });
  }
};
