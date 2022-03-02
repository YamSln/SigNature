// ---- First renderer process ----
const { ipcRenderer } = require("electron");

const { ENGLISH, HEBREW } = require("./src/db.model");
// Language dictionary
let dictionary;
// Language change event listener
ipcRenderer.on("languageChange", function (evt, updatedDictionary) {
  dictionary = updatedDictionary;
  document.getElementById("nameLabel").innerHTML = dictionary.name;
  document.getElementById("posLabel").innerHTML = dictionary.position;
  document.getElementById("emailLabel").innerHTML = dictionary.email;
  document.getElementById("phoneLabel").innerHTML = dictionary.mobile;
  document.getElementById("save").innerHTML = dictionary.save;
  document.getElementById("clear").innerHTML = dictionary.clear;
  changeItemsDirection(dictionary.lang);
});
// Changes direction of elements according to selected language
function changeItemsDirection(lang) {
  switch (lang) {
    case HEBREW:
      document.querySelector("html").classList.add("is-rtl");
      break;
    case ENGLISH:
    default:
      document.querySelector("html").classList.remove("is-rtl");
  }
}
// Form submission
function onSubmit() {
  const name = document.getElementById("name");
  const position = document.getElementById("pos");
  const email = document.getElementById("email");
  const phone = document.getElementById("phone");
  // Input validation
  const payload = validateInput(name, position, email, phone);
  if (payload) {
    // Send submission payload
    ipcRenderer.send("form-submit", payload);
  }
}

function clearForm() {
  document.getElementById("form").reset();
}
// Set validation messages according to input
function validateInput(name, position, email, phone) {
  let phoneNumber;
  if (name.validity.valueMissing) {
    name.setCustomValidity(dictionary.missingField);
    name.reportValidity();
    return false;
  }
  if (position.validity.valueMissing) {
    position.setCustomValidity(dictionary.missingField);
    position.reportValidity();
    return false;
  }
  if (email.validity.valueMissing) {
    email.setCustomValidity(dictionary.missingField);
    email.reportValidity();
    return false;
  } else if (email.validity.typeMismatch) {
    email.setCustomValidity(dictionary.invalidEmail);
    email.reportValidity();
    return false;
  }
  if (phone.validity.valueMissing) {
    phone.setCustomValidity(dictionary.missingField);
    phone.reportValidity();
    return false;
  } else if (phone.validity.patternMismatch) {
    phone.setCustomValidity(dictionary.numberTooShort);
    phone.reportValidity();
    return false;
  } else {
    phoneNumber = phone.value;
    if (phoneNumber[0] == 0) {
      phoneNumber = phoneNumber.substring(0);
    }
  } // Returns input values as payload
  return {
    name: name.value,
    position: position.value,
    email: email.value,
    phone: phoneNumber,
  };
}
// Validate input and allow only numbers
function isNumber(evt) {
  // Get character code from event
  evt = evt ? evt : window.event;
  var charCode = evt.which ? evt.which : evt.keyCode;
  // Allow input if character code is a number
  if (charCode > 31 && (charCode < 48 || charCode > 57)) {
    return false;
  }
  return true;
}
