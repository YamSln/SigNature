const ISRAEL_CALLING_CODE = "+972 ";
const LOWER_CHAR_BOUND = 31;
const UPPER_CHAR_BOUND = 48;
const OTHER_CHARS = 57;
const TAG_PREFIX = "!!";
const NAME = TAG_PREFIX + "name";
const POSITION = TAG_PREFIX + "pos";
const EMAIL = TAG_PREFIX + "email";
const MOBILE = TAG_PREFIX + "mobile";
const OFFICE = TAG_PREFIX + "office";
const FAX = TAG_PREFIX + "fax";
const ADDRESS = TAG_PREFIX + "address";
const LINKEDIN = TAG_PREFIX + "linkedin";
const FACEBOOK = TAG_PREFIX + "facebook";
const YOUTUBE = TAG_PREFIX + "youtube";
const INSTAGRAM = TAG_PREFIX + "instagram";
// Constants Export
exports.NAME = NAME;
exports.POSITION = POSITION;
exports.EMAIL = EMAIL;
exports.MOBILE = MOBILE;
exports.OFFICE = OFFICE;
exports.FAX = FAX;
exports.ADDRESS = ADDRESS;
exports.LINKEDIN = LINKEDIN;
exports.FACEBOOK = FACEBOOK;
exports.YOUTUBE = YOUTUBE;
exports.INSTAGRAM = INSTAGRAM;
// Validate input and allow only numbers
function isNumber(evt) {
  // Get character code from event
  evt = evt ? evt : window.event;
  var charCode = evt.which ? evt.which : evt.keyCode;
  // Allow input if character code is a number
  if (
    charCode > LOWER_CHAR_BOUND &&
    (charCode < UPPER_CHAR_BOUND || charCode > OTHER_CHARS)
  ) {
    return false;
  }
  return true;
}
// Validate URL
function isURL(url) {
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
// Returns formatted phone number
function formatPhoneNumber(number, mobile) {
  if (number[0] == 0) {
    number = number.slice(1);
  }
  return (
    ISRAEL_CALLING_CODE +
    number.slice(0, mobile ? 2 : 1) +
    "-" +
    number.substring(mobile ? 2 : 1)
  );
}
// Returns original phone number (unformatted)
function deFormatPhoneNumber(number) {
  deFormatted = number.replace("+972 ", "0");
  return deFormatted.replace("-", "");
}
// Loading
function triggerLoading(trigger, loadingElement) {
  if (trigger) {
    loadingElement.classList.add("loading");
  } else {
    loadingElement.classList.remove("loading");
  }
}
