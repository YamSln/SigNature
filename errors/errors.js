exports.InvalidLanguageError = class InvalidLanguageError extends Error {
  constructor(message) {
    super(message);
    this.name = "InvalidLanguageError";
  }
};

exports.InvalidURLError = class InvalidURLError extends Error {
  constructor(message) {
    super(message);
    this.name = "InvalidURLError";
  }
};

exports.InvalidPhoneNumberError = class InvalidPhoneNumberError extends Error {
  constructor(message) {
    super(message);
    this.name = "InvalidPhoneNumberError";
  }
};
