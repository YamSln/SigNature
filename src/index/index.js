// ---- Main form renderer process ----
const { ipcRenderer, shell } = require("electron");
const { ENGLISH, HEBREW } = require("../model/db.model");
// Language dictionary
let dictionary;
let filePath;
// Language change event listener
ipcRenderer.on("languageChange", (evt, updatedDictionary) => {
  dictionary = updatedDictionary;
  document.getElementById("nameLabel").innerHTML = dictionary.name;
  document.getElementById("posLabel").innerHTML = dictionary.position;
  document.getElementById("emailLabel").innerHTML = dictionary.email;
  document.getElementById("phoneLabel").innerHTML = dictionary.mobile;
  document.getElementById("save").innerHTML = dictionary.save;
  document.getElementById("clear").innerHTML = dictionary.clear;
  document.getElementById("preview").innerHTML = dictionary.preview;
  document.getElementById("open").innerHTML = dictionary.open;
  document.getElementById("open-folder").innerHTML = dictionary.openFolder;
  document.getElementById("toast-title").innerHTML =
    dictionary.savedSuccessfully;
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
// Resets form fields
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
    phone.setCustomValidity(dictionary.invalidNumber);
    phone.reportValidity();
    return false;
  } else {
    phoneNumber = formatPhoneNumber(phone.value, true);
  } // Returns input values as payload
  return {
    name: name.value,
    position: position.value,
    email: email.value,
    phone: phoneNumber,
  };
}

// ---- Loading ----

ipcRenderer.on("loading", (evt, isLoading) => {
  const loader = document.getElementById("loader");
  triggerLoading(isLoading, loader);
});

// ---- Toast Notification ----

ipcRenderer.on("saved-successfully", (evt, payload) => {
  filePath = payload; // Set saved file path
  const toast = document.getElementById("alert");
  const alert = new bootstrap.Toast(toast);
  alert.show();
});

function openFile() {
  shell.openPath(filePath);
}

function openFileLocation() {
  shell.showItemInFolder(filePath);
}

// preview

function openPreview() {
  const name = document.getElementById("name");
  const position = document.getElementById("pos");
  const email = document.getElementById("email");
  const phone = document.getElementById("phone");
  // Input validation
  const payload = validateInput(name, position, email, phone);
  if (payload) {
    // Send submission payload
    ipcRenderer.send("preview", payload);
  }
}
