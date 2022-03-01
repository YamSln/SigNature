const InvalidLanguageError = require("./errors/errors").InvalidLanguageError;

const InvalidURLError = require("./errors/errors").InvalidURLError;

const ENGLISH = "en";
const HEBREW = "he";

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
    if (preferredLang && (preferredLang !== HEBREW || ENGLISH)) {
      throw new InvalidLanguageError("Invalid language");
    }
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

  _isUrlsValid(urls) {
    for (let i = 0; urls.length; i++) {
      if (!this._isUrlValid(urls[i])) {
        return false;
      }
      return true;
    }
  }

  _isUrlValid(url) {
    if (!url) {
      return true;
    }
    var pattern = new RegExp(
      "^(https?:\\/\\/)?" + // protocol
        "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
        "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
        "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
        "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
        "(\\#[-a-z\\d_]*)?$", // fragment locator
      "i"
    );
    return !!pattern.test(str);
  }
};
