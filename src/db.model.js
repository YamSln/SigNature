const { InvalidLanguageError, InvalidURLError } = require("../errors/errors");
// Language codes
const ENGLISH = "en";
const HEBREW = "he";

exports.ENGLISH = ENGLISH;
exports.HEBREW = HEBREW;
// DB Model
exports.dbStructure = class dbStructure {
  constructor(
    preferredLang,
    office,
    fax,
    address,
    facebook,
    linkedin,
    youtube,
    instagram
  ) {
    // language validation
    if (preferredLang && (preferredLang !== HEBREW || ENGLISH)) {
      throw new InvalidLanguageError("Invalid language");
    } // urls validation
    if (!this._isUrlsValid([facebook, linkedin, youtube, instagram])) {
      throw new InvalidURLError("An invalid URL exists");
    }
    this.preferredLang = preferredLang;
    this.office = office;
    this.fax = fax;
    this.address = address;
    this.facebook = facebook;
    this.linkedin = linkedin;
    this.youtube = youtube;
    this.instagram = instagram;
  }
  // url validation
  _isUrlsValid(urls) {
    for (url of urls) {
      if (!this.isURL(url)) {
        return false;
      }
      return true;
    }
  }
};
