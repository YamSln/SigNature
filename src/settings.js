// ---- Settings renderer process ----
const { ipcRenderer } = require("electron");

const { ENGLISH, HEBREW } = require("./db.model");
// Language dictionary
let dictionary;
// Language change event listener
ipcRenderer.on("languageChange", function (evt, updatedDictionary) {
  dictionary = updatedDictionary;
  document.getElementById("officeLabel").innerHTML = dictionary.office;
  document.getElementById("faxLabel").innerHTML = dictionary.fax;
  document.getElementById("linkedinLabel").innerHTML = dictionary.linkedin;
  document.getElementById("facebookLabel").innerHTML = dictionary.facebook;
  document.getElementById("youtubeLabel").innerHTML = dictionary.youtube;
  document.getElementById("instagramLabel").innerHTML = dictionary.instagram;
  document.getElementById("backIcon").src = dictionary.backIcon;
  document.getElementById("save").innerHTML = dictionary.save;
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
function onSubmit() {}
// Navigates back to first renderer process
function navigateBack() {
  ipcRenderer.send("navigate-to-main");
}
