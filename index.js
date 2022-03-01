const electron = require("electron");
const ipc = electron.ipcRenderer;

const ENGLISH = "en";
const HEBREW = "he";

let dictionary;

ipc.on("languageChange", function (evt, updatedDictionary) {
  dictionary = updatedDictionary;
  document.getElementById("nameLabel").innerHTML = dictionary.name;
  document.getElementById("posLabel").innerHTML = dictionary.position;
  document.getElementById("emailLabel").innerHTML = dictionary.email;
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
