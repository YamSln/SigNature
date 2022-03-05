const fs = require("fs");
const { DatabaseError } = require("../errors/errors");
const { ENGLISH, HEBREW, DBStructure } = require("./db.model");

const dbUrl = require("path").resolve(__dirname, "../../db/db.json");
// DB handler, handles db connection and operations
exports.dbHandler = class dbHandler {
  constructor() {
    try {
      this.db = require(dbUrl);
    } catch {
      // DB is empty
      this._initDB();
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
      JSON.stringify(
        new DBStructure(
          lang,
          this.db.office,
          this.db.fax,
          this.db.address,
          this.db.linkedin,
          this.db.facebook,
          this.db.youtube,
          this.db.instagram
        )
      ),
      (err) => {
        this._handleDBUpdate(err);
      }
    );
  }
  // Updates settings in db
  _updateSettings(settings) {
    fs.writeFile(
      dbUrl,
      JSON.stringify(
        new DBStructure(
          this.preferredLang,
          settings.office,
          settings.fax,
          settings.address,
          settings.linkedin,
          settings.facebook,
          settings.youtube,
          settings.instagram
        )
      ),
      (err) => {
        this._handleDBUpdate(err);
      }
    );
  }
  // Initialize DB
  _initDB() {
    this.db = {};
    fs.writeFile(dbUrl, JSON.stringify(new DBStructure()), (err) => {
      this._handleDBUpdate(err);
    });
  }
  _handleDBUpdate(err) {
    if (err) {
      throw new DatabaseError("An unexpected error occurred");
    } else {
      this._rCache();
      this.db = require(dbUrl);
    }
  }
  // Cache refresh for db file
  _rCache() {
    delete require.cache[require.resolve(dbUrl)];
  }
};
