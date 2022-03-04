const fs = require("fs");
const { DatabaseError } = require("../errors/errors");
const { ENGLISH, HEBREW } = require("./db.model");

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
  get preferredLang() {
    return this.db.preferredLang;
  } // Set preferred language and update db
  set preferredLang(lang) {
    this._updatePreferredLanguage(lang);
  }
  //Returns settings from db
  get settings() {
    return this.db;
  }
  // Update settings
  updateSettings(settings) {
    try {
      this._updateSettings(settings);
      return Promise.resolve(true);
    } catch (DatabaseError) {
      return Promise.reject(DatabaseError);
    }
  }
  // Updates preferred language in db
  _updatePreferredLanguage(lang) {
    lang === HEBREW || ENGLISH ? lang : ENGLISH;
    fs.writeFile(
      dbUrl,
      JSON.stringify({ ...this.db, preferredLang: lang }),
      (err) => {
        if (err) {
          throw new DatabaseError("An unexpected error occurred");
        } else {
          this._rCache();
          this.db = require(dbUrl);
        }
      }
    );
  }
  // Updates settings in db
  _updateSettings(settings) {
    fs.writeFile(
      dbUrl,
      JSON.stringify({
        ...this.db,
        office: settings.office,
        fax: settings.fax,
        linkedin: settings.linkedin,
        facebook: settings.facebook,
        youtube: settings.youtube,
        instagram: settings.instagram,
      }),
      (err) => {
        if (err) {
          throw new DatabaseError("An unexpected error occurred");
        } else {
          this._rCache();
          this.db = require(dbUrl);
        }
      }
    );
  }
  // Cache refresh for db file
  _rCache() {
    delete require.cache[require.resolve(dbUrl)];
  }
};
