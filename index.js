const { ipcRenderer } = require("electron");

const { ENGLISH, HEBREW } = require("./db.model");

let dictionary;

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

function onSubmit() {
  const name = document.getElementById("name");
  const position = document.getElementById("pos");
  const email = document.getElementById("email");
  const phone = document.getElementById("phone");
  const payload = validateInput(name, position, email, phone);
  if (payload) {
    ipcRenderer.send("form-submit", payload);
  }
}

function clearForm() {
  document.getElementById("form").reset();
}

function validateInput(name, position, email, phone) {
  if (name.validity.valueMissing) {
    name.setCustomValidity(dictionary.missingField);
    return false;
  }
  if (position.validity.valueMissing) {
    position.setCustomValidity(dictionary.missingField);
    return false;
  }
  if (email.validity.valueMissing) {
    email.setCustomValidity(dictionary.missingField);
    return false;
  } else if (email.validity.typeMismatch) {
    email.setCustomValidity(dictionary.invalidEmail);
    return false;
  }
  if (phone.validity.valueMissing) {
    phone.setCustomValidity(dictionary.missingField);
    return false;
  }
  return {
    name: name.value,
    position: position.value,
    email: email.value,
    phone: phone.value,
  };
}
