// ---- Main Process ----
const { app, BrowserWindow, Menu, ipcMain, dialog } = require("electron");
const { dbHandler } = require("./src/dbHandler");
const { ENGLISH, HEBREW } = require("./src/db.model");
const fs = require("fs");
const { spawn } = require("child_process");
const path = require("path");

const db = new dbHandler();
const isMac = isPlatformMac();
const ONE_SECOND_MILL = 1000;

let win; // Main window
let dict; // Dictionary

// Main window
function createWindow() {
  win = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      defaultFontFamily: "Assistant",
    },
  });
  win.loadFile("./src/index.html");
  win.webContents.openDevTools();
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
  setDictionary(lang.includes(HEBREW) ? HEBREW : ENGLISH);
  saveLanguage(lang.includes(HEBREW) ? HEBREW : ENGLISH);
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
      filters: [
        {
          // Allow only HTML files to be saved
          name: "HTML Files",
          extensions: ["html"],
        },
      ],
    })
    .then((file) => {
      console.log(file.filePath.toString());
      if (!file.canceled) {
        // Handle file saving
        sendLoadingEvent(evt, true);
        fs.writeFile(file.filePath.toString(), "Signature", (err) => {
          setTimeout(() => {
            sendLoadingEvent(evt, false);
          }, ONE_SECOND_MILL);
        });
      }
    })
    .catch((err) => {
      sendLoadingEvent(evt, false);
    });
});

ipcMain.on("navigate-to-main", () => {
  win.loadFile("./src/index.html");
});

// ---- Navigation ----

function navigateToSettings() {
  win.loadFile("./src/settings.html");
  win.webContents.send("set-settings", db.settings);
}

// ---- Loading ----

function sendLoadingEvent(event, loading) {
  event.sender.send("loading", loading);
}

// ---- Database ----

ipcMain.on("database-update", (evt, payload) => {
  sendLoadingEvent(evt, true);
  db.updateSettings(payload)
    .then(() => {
      setTimeout(() => {
        evt.sender.send("set-settings", db.settings);
        sendLoadingEvent(evt, false);
      }, ONE_SECOND_MILL);
    })
    .catch((err) => {
      dialog.showErrorBox(dict.uxError);
    });
});

ipcMain.on("init-settings", (evt) => {
  sendLoadingEvent(evt, true);
  evt.sender.send("set-settings", db.settings);
  setTimeout(() => {
    sendLoadingEvent(evt, false);
  }, ONE_SECOND_MILL);
});
