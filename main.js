// ---- Main Process ----
const { app, BrowserWindow, Menu, ipcMain, dialog } = require("electron");
const { dbHandler } = require("./src/model/dbHandler");
const { ENGLISH, HEBREW } = require("./src/model/db.model");
const fs = require("fs");
const { Logger } = require("./log/logger");
const {
  NAME,
  ADDRESS,
  EMAIL,
  FACEBOOK,
  FAX,
  INSTAGRAM,
  LINKEDIN,
  MOBILE,
  OFFICE,
  POSITION,
  YOUTUBE,
  WEBSITE,
} = require("./src/utils");
const { MissingResourceError } = require("./src/errors/errors");
const path = require("path");
require("dotenv").config();
// DB and utils
const db = new dbHandler();
const isMac = isPlatformMac();
const TIMEOUT = 500;
// Logging
const logger = new Logger();

let win; // Main window
let dict; // Dictionary
// Disable chrome hardware acceleration
app.disableHardwareAcceleration();
// Catch unhandled errors
process.setUncaughtExceptionCaptureCallback((err) => {
  if (process.env.ENV === "dev") {
    dialog.showErrorBox(dict.error, err);
  } else {
    dialog.showErrorBox(dict.error, dict.uxError);
    logger.error(err);
    process.exit(1);
  }
});
// Main window
function createWindow() {
  win = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      defaultFontFamily: "Assistant",
    },
    width: 600,
    height: 800,
    resizable: false,
    icon: "./assets/icons/app.ico",
  });
  win.loadFile("./src/index/index.html");
  win;
  // Open devtools on dev mode
  if (process.env.ENV === "dev") {
    win.webContents.openDevTools();
  }
  win.on("close", () => {
    win = null;
  });
}
// Init language according to preferred language
function initLanguage() {
  db.preferredLang // Has preferred lang
    ? setDictionary(db.preferredLang) // Set it
    : setLanguage(app.getLocale()); // Set as system lang and save
}
// Load language
function setDictionary(lang) {
  dict = lang.includes(HEBREW)
    ? require("./lang/he.json")
    : require("./lang/en.json");
}
// Sets language, saves to db and renders application menu
function setLanguage(lang) {
  const language = lang.includes(HEBREW) ? HEBREW : ENGLISH;
  setDictionary(language);
  saveLanguage(language);
  createMenu();
}
// Saves and updates language
function saveLanguage(lang) {
  db.preferredLang = lang;
}
// Application Menu
function createMenu() {
  const fileMenu = {
    label: dict.file,
    submenu: [
      {
        // Settings button
        label: dict.settings,
        click: navigateToSettings,
      },
      {
        label: dict.help,
        click: openHelpWindow,
      },
      {
        type: "separator",
      },
      {
        // Exit button
        label: dict.exit,
        role: isMac ? "close" : "quit",
      },
    ],
  };
  const languageMenu = {
    label: dict.language,
    submenu: [
      {
        // English button
        label: dict.english,
        type: "radio",
        checked: isLanguage(ENGLISH),
        click: () => {
          if (!isLanguage(ENGLISH)) {
            setLanguage(ENGLISH);
            sendLanguageChange();
          }
        },
      },
      {
        // Hebrew button
        label: dict.hebrew,
        type: "radio",
        checked: isLanguage(HEBREW),
        click: () => {
          if (!isLanguage(HEBREW)) {
            setLanguage(HEBREW);
            sendLanguageChange();
          }
        },
      },
    ],
  };
  // Render menu at an order according to selected language
  const appMenu = Menu.buildFromTemplate(
    isLanguage(HEBREW) ? [languageMenu, fileMenu] : [fileMenu, languageMenu]
  );
  Menu.setApplicationMenu(appMenu);
}
function isLanguage(lang) {
  return dict.lang === lang;
}
// Start initializations and rendering
app.on("ready", () => {
  initLanguage();
  createWindow();
  createMenu();
  win.webContents.on("dom-ready", sendLanguageChange);
});

function openHelpWindow() {
  const helpWindow = new BrowserWindow({
    parent: win,
    modal: true,
    resizable: false,
    width: 600,
    height: 400,
    icon: "./assets/icons/app.ico",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  }); // Insert HTML template to new window
  helpWindow.menuBarVisible = false;
  helpWindow.loadFile("./src/help.html");
}

// ---- MAC Support ----

function isPlatformMac() {
  return process.platform == "darwin";
}

app.on("window-all-closed", () => {
  if (!isMac) {
    app.quit();
  }
});

app.on("activate", () => {
  if (win === null) {
    createWindow();
  }
});

// ---- IPC Handling ----

function sendLanguageChange() {
  // Language change event
  win.webContents.send("languageChange", dict);
}
// Form submission event listener
ipcMain.on("form-submit", (evt, payload) => {
  dialog // Open save dialog
    .showSaveDialog({
      title: dict.saveFile,
      // Default name is email.signature
      defaultPath: payload.email + ".signature",
      filters: [
        {
          // Allow only HTML files to be saved
          name: "HTML Files",
          extensions: ["html"],
        },
      ],
    })
    .then((file) => {
      if (!file.canceled) {
        // Handle file saving
        sendLoadingEvent(evt, true);
        const signature = generateSignature(payload);
        fs.writeFile(file.filePath.toString(), signature, (err) => {
          setTimeout(() => {
            evt.sender.send("saved-successfully", file.filePath.toString());
            sendLoadingEvent(evt, false);
          }, TIMEOUT);
        });
      }
    })
    .catch((err) => {
      logger.error(err, "Main Process");
      dialog.showErrorBox(dict.error, dict.uxError);
      sendLoadingEvent(evt, false);
    });
});
// Signature preview window
ipcMain.on("preview", (evt, payload) => {
  try {
    sendLoadingEvent(evt, true);
    const signature = generateSignature(payload);
    const previewWindow = new BrowserWindow({
      parent: win,
      modal: true,
      resizable: false,
      width: 700,
      height: 400,
      icon: "./assets/icons/app.ico",
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    }); // Insert HTML template to new window
    previewWindow.menuBarVisible = false;
    //previewWindow.openDevTools();
    // Load preview window and send signature to it
    previewWindow.loadFile("./src/preview/preview.html");
    previewWindow.webContents.on("did-finish-load", () => {
      previewWindow.webContents.send("set-preview", signature);
    });
  } catch (err) {
    logger.error(err);
    dialog.showErrorBox(dict.error, dict.uxError);
  } finally {
    sendLoadingEvent(evt, false);
  }
});
// Template browsing
ipcMain.on("browse-template", (evt) => {
  dialog // Open dialog
    .showOpenDialog({
      title: dict.browseLabel,
      filters: [{ name: "HTML Files", extensions: ["HTML"] }],
      properties: ["openFile"],
    }) // Read from file
    .then((file) => {
      if (!file.canceled) {
        sendLoadingEvent(evt, true);
        const filePath = file.filePaths[0];
        fs.readFile(filePath, (err, data) => {
          if (!err) {
            // Save data in db
            const fileName = path.basename(filePath);
            db.updateSignature(fileName, data.toString())
              .then(() => {
                setTimeout(() => {
                  evt.sender.send("signature-uploaded", fileName);
                  sendLoadingEvent(evt, false);
                }, TIMEOUT);
              })
              .catch((err) => {
                logger.error(err);
                dialog.showErrorBox(dict.error, dict.uxError);
                sendLoadingEvent(evt, false);
              });
          }
        });
      }
    })
    .catch((err) => {
      logger.error(err);
      dialog.showErrorBox(dict.error, dict.uxError);
      sendLoadingEvent(evt, false);
    });
});

// ---- Navigation ----

function navigateToSettings() {
  win.loadFile("./src/settings/settings.html");
  win.webContents.send("set-settings", {
    ...db.settings,
    template: db.signatureName,
  });
}

ipcMain.on("navigate-to-main", () => {
  win.loadFile("./src/index/index.html");
});

// ---- Loading ----

function sendLoadingEvent(event, loading) {
  event.sender.send("loading", loading);
}

// ---- Database ----

// Update database with new settings
ipcMain.on("database-update", (evt, payload) => {
  sendLoadingEvent(evt, true);
  db.updateSettings(payload)
    .then(() => {
      setTimeout(() => {
        evt.sender.send("set-settings", {
          ...db.settings,
          template: db.signatureName,
        });
        sendLoadingEvent(evt, false);
      }, TIMEOUT);
    })
    .catch((err) => {
      logger.error(err, "Main Process");
      sendLoadingEvent(evt, false);
      dialog.showErrorBox(dict.error, dict.uxError);
    });
});
// Loads settings from db and sends to settings renderer process
ipcMain.on("init-settings", (evt) => {
  sendLoadingEvent(evt, true);
  evt.sender.send("set-settings", {
    ...db.settings,
    template: db.signatureName,
  });
  setTimeout(() => {
    sendLoadingEvent(evt, false);
  }, TIMEOUT);
});
// Load signature from local db
function generateSignature(payload) {
  const settings = db.settings;
  let signature;
  try {
    signature = db.signatureTemplate;
  } catch {
    throw new MissingResourceError("Signature is not loaded");
  }
  // Replace all flags with use input
  return signature
    .replace(new RegExp(NAME, "g"), payload.name)
    .replace(new RegExp(EMAIL, "g"), payload.email)
    .replace(new RegExp(POSITION, "g"), payload.position)
    .replace(new RegExp(MOBILE, "g"), payload.phone)
    .replace(new RegExp(OFFICE, "g"), settings.office)
    .replace(new RegExp(FAX, "g"), settings.fax)
    .replace(new RegExp(ADDRESS, "g"), settings.address)
    .replace(new RegExp(WEBSITE, "g"), settings.website)
    .replace(new RegExp(LINKEDIN, "g"), settings.linkedin)
    .replace(new RegExp(FACEBOOK, "g"), settings.facebook)
    .replace(new RegExp(YOUTUBE, "g"), settings.youtube)
    .replace(new RegExp(INSTAGRAM, "g"), settings.instagram);
}
