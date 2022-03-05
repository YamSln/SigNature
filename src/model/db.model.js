const { InvalidLanguageError, InvalidURLError } = require("../errors/errors");
// Language codes
const ENGLISH = "en";
const HEBREW = "he";

exports.ENGLISH = ENGLISH;
exports.HEBREW = HEBREW;
// DB Model
exports.DBStructure = class DBStructure {
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
    if (!preferredLang) {
      this.preferredLang = "";
    } else if (preferredLang !== HEBREW && preferredLang !== ENGLISH) {
      throw new InvalidLanguageError("Invalid language");
    } else {
      this.preferredLang = preferredLang;
    } // urls validation
    if (!this._isUrlsValid([facebook, linkedin, youtube, instagram])) {
      throw new InvalidURLError("An invalid URL exists");
    }
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
    for (let url of urls) {
      if (!this._isURL(url)) {
        return false;
      }
      return true;
    }
  }
  _isURL(url) {
    // Empty url
    if (!url) {
      return true;
    } // URL regex pattern
    var pattern = new RegExp(
      "^(https?:\\/\\/)?" + // protocol
        "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
        "((\\d{1,3}\\.){3}\\d{1,3}))" + // ip address
        "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
        "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
        "(\\#[-a-z\\d_]*)?$", // fragment locator
      "i"
    );
    return !!pattern.test(url);
  }
};
