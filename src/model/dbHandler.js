const fs = require("fs");
const { DatabaseError, IllegalArgumentError } = require("../errors/errors");
const { ENGLISH, HEBREW, DBStructure } = require("./db.model");

const dbUrl = require("path").resolve(__dirname, "../../db/db.json");
const signatureUrl = require("path").resolve(
  __dirname,
  "../../db/signature.json"
);
// DB handler, handles db connection and operations
exports.dbHandler = class dbHandler {
  constructor() {
    try {
      this.db = require(dbUrl);
    } catch {
      // DB is empty
      this._initDB();
    }
    try {
      this.signature = require(signatureUrl);
    } catch {
      this._initSignature();
    }
  } // Returns a copy of the db object
  get preferredLang() {
    return this.db.preferredLang;
  } // Set preferred language and update db
  set preferredLang(lang) {
    this._updatePreferredLanguage(lang);
  }
  // Returns settings from db
  get settings() {
    return this.db;
  }
  // Returns signature string
  get signatureTemplate() {
    return this.signature.template;
  }
  // Returns signature name
  get signatureName() {
    return this.signature.name;
  }
  // Updates signature string
  updateSignature(name, signature) {
    try {
      this._updateSignature(name, signature);
      return Promise.resolve(true);
    } catch (DatabaseError) {
      return Promise.reject(DatabaseError);
    }
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
          this.db.website,
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
          settings.website,
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
  _updateSignature(name, signature) {
    if (signature.match(/script|iframe|webview/)) {
      throw new IllegalArgumentError("Illegal Signature");
    }
    fs.writeFile(
      signatureUrl,
      JSON.stringify({ name, template: signature }),
      (err) => {
        this._handleSignatureUpdate(err);
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
  // Initialize Signature
  _initSignature() {
    this.db = {};
    fs.writeFile(
      signatureUrl,
      JSON.stringify({ name: "", template: "" }),
      (err) => {
        this._handleSignatureUpdate(err);
      }
    );
  }
  _handleDBUpdate(err) {
    if (err) {
      throw new DatabaseError("Error", "An unexpected error occurred");
    } else {
      this._rCache();
      this.db = require(dbUrl);
    }
  }
  _handleSignatureUpdate(err) {
    if (err) {
      throw new DatabaseError("Error", "An unexpected error occurred");
    } else {
      this._rCache();
      this.signature = require(signatureUrl);
    }
  }
  // Cache refresh for db file
  _rCache() {
    delete require.cache[require.resolve(dbUrl)];
    delete require.cache[require.resolve(signatureUrl)];
  }
};
