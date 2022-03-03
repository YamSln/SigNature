const fs = require("fs");
const { DatabaseError } = require("../errors/errors");

const dbUrl = require("path").resolve(__dirname, "../db/db.json");
// DB handler, handles db connection and operations
exports.dbHandler = class dbHandler {
  constructor() {
    try {
      this.db = require(dbUrl);
    } catch {
      // DB is empty
      this.db = {};
      this.updateDb({});
    }
  } // Returns a copy of the db object
  get dbContent() {
    return this.db;
  }
  // Write updated object to db
  updateDb(db) {
    fs.writeFile(dbUrl, JSON.stringify(db), (err) => {
      if (err) {
        throw new DatabaseError("An unexpected error occurred");
      } else {
        this.db = require(dbUrl);
      }
    });
  }
};
