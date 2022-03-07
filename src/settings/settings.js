// ---- Settings renderer process ----
const { ipcRenderer, dialog, app } = require("electron");
const { ENGLISH, HEBREW } = require("../model/db.model");
// Language dictionary
let dictionary;
// Language change event listener
ipcRenderer.on("languageChange", function (evt, updatedDictionary) {
  dictionary = updatedDictionary;
  document.getElementById("officeLabel").innerHTML = dictionary.office;
  document.getElementById("faxLabel").innerHTML = dictionary.fax;
  document.getElementById("addressLabel").innerHTML = dictionary.address;
  document.getElementById("websiteLabel").innerHTML = dictionary.website;
  document.getElementById("linkedinLabel").innerHTML = dictionary.linkedin;
  document.getElementById("facebookLabel").innerHTML = dictionary.facebook;
  document.getElementById("youtubeLabel").innerHTML = dictionary.youtube;
  document.getElementById("instagramLabel").innerHTML = dictionary.instagram;
  document.getElementById("templateLabel").innerHTML = dictionary.template;
  document.getElementById("browse").innerHTML = dictionary.browse;
  document.getElementById("backIcon").src = dictionary.backIcon;
  document.getElementById("save").innerHTML = dictionary.save;
  changeItemsDirection(dictionary.lang);
});
// Set settings from db
ipcRenderer.on("set-settings", (evt, settings) => {
  // Set each input
  document.querySelectorAll("input").forEach((input) => {
    const value = settings[input.id];
    if (value) {
      // Data has value, if it has format it
      input.value = value.includes(ISRAEL_CALLING_CODE)
        ? deFormatPhoneNumber(value) // DeFormat phone numbers
        : value;
    }
  });
});
ipcRenderer.on("signature-uploaded", (evt, name) => {
  console.log(name);
  document.getElementById("template").value = name;
});
function init() {
  ipcRenderer.send("init-settings");
}
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
  const office = document.getElementById("office");
  const fax = document.getElementById("fax");
  const address = document.getElementById("address");
  const website = document.getElementById("website");
  const linkedin = document.getElementById("linkedin");
  const facebook = document.getElementById("facebook");
  const youtube = document.getElementById("youtube");
  const instagram = document.getElementById("instagram");
  const payload = validateInput(
    office,
    fax,
    address,
    website,
    linkedin,
    facebook,
    youtube,
    instagram
  ); // Send valid payload for db update
  if (payload) {
    ipcRenderer.send("database-update", payload);
  }
}
// Input validation
function validateInput(
  office,
  fax,
  address,
  website,
  linkedin,
  facebook,
  youtube,
  instagram
) {
  let officeNumber;
  let faxNumber;
  if (office.validity.valueMissing) {
    office.setCustomValidity(dictionary.missingField);
    office.reportValidity();
    return false;
  } else if (office.validity.rangeUnderflow || office.validity.rangeOverflow) {
    office.setCustomValidity(dictionary.invalidNumber);
    office.reportValidity();
    return false;
  } else {
    officeNumber = formatPhoneNumber(office.value, false);
  }
  if (fax.validity.valueMissing) {
    fax.setCustomValidity(dictionary.missingField);
    fax.reportValidity();
    return false;
  } else if (fax.validity.rangeUnderflow || fax.validity.rangeOverflow) {
    fax.setCustomValidity(dictionary.invalidNumber);
    fax.reportValidity();
    return false;
  } else {
    faxNumber = formatPhoneNumber(fax.value, false);
  } // Returns payload to save
  for (let url of [website, linkedin, facebook, youtube, instagram]) {
    if (!isURL(url.value)) {
      url.setCustomValidity(dictionary.invalidURL);
      url.reportValidity();
      return false;
    }
  }
  return {
    office: officeNumber,
    fax: faxNumber,
    address: address.value,
    website: website.value,
    linkedin: linkedin.value,
    facebook: facebook.value,
    youtube: youtube.value,
    instagram: instagram.value,
  };
}

function browseTemplate() {
  ipcRenderer.send("browse-template");
}

// Navigates back to first renderer process
function navigateBack() {
  ipcRenderer.send("navigate-to-main");
}

// ---- Loading ----

ipcRenderer.on("loading", (evt, isLoading) => {
  const loader = document.getElementById("loader");
  triggerLoading(isLoading, loader);
});

function triggerLoading(trigger, loadingElement) {
  if (trigger) {
    loadingElement.classList.add("loading");
  } else {
    loadingElement.classList.remove("loading");
  }
}
// Set buttons event listeners
window.onload = () => {
  init();
  document.getElementById("browse").onclick = browseTemplate;
  document.getElementById("back").onclick = navigateBack;
  document.getElementById("save").onclick = onSubmit;
  document.querySelectorAll("input").forEach((input) => {
    input.oninput = () => input.setCustomValidity("");
  });
};
