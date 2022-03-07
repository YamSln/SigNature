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

exports.DatabaseError = class DatabaseError extends Error {
  constructor(message) {
    super(message);
    this.name = "DatabaseError";
  }
};

exports.IllegalArgumentError = class IllegalArgumentError extends Error {
  constructor(message) {
    super(message);
    this.name = "IllegalArgumentError";
  }
};

exports.MissingResourceError = class MissingResourceError extends Error {
  constructor(message) {
    super(message);
    this.name = "MissingResourceError";
  }
};
