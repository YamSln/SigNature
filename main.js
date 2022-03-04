// ---- Main Process ----
const { app, BrowserWindow, Menu, ipcMain, dialog } = require("electron");
const { dbHandler } = require("./src/dbHandler");
const { ENGLISH, HEBREW } = require("./src/db.model");
const fs = require("fs");

const db = new dbHandler();
const isMac = isPlatformMac();

let win; // Main window
let languageDictionary; // Dictionary
let database; // Database object
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
// Init language according to preferred language or system language
function initLanguage() {
  loadLanguage(database.preferredLang || app.getLocale());
}
// Loads language, saves to db and renders application menu
function loadLanguage(lang) {
  if (lang.includes(HEBREW)) {
    languageDictionary = require("./lang/he.json");
    saveLanguage(HEBREW);
    createMenu();
  } else {
    languageDictionary = require("./lang/en.json");
    saveLanguage(ENGLISH);
    createMenu();
  }
}
// Saves and updates language
function saveLanguage(lang) {
  database.preferredLang = lang;
  db.updateDb(database);
}
// Application Menu
function createMenu() {
  const fileMenu = {
    label: languageDictionary.file,
    submenu: [
      {
        // Settings button
        label: languageDictionary.settings,
        click: navigateToSettings,
      },
      {
        type: "separator",
      },
      {
        // Exit button
        label: languageDictionary.exit,
        role: isMac ? "close" : "quit",
      },
    ],
  };
  const languageMenu = {
    label: languageDictionary.language,
    submenu: [
      {
        // English button
        label: languageDictionary.english,
        type: "radio",
        checked: isLanguage(ENGLISH),
        click: () => {
          if (!isLanguage(ENGLISH)) {
            loadLanguage(ENGLISH);
            sendLanguageChange();
          }
        },
      },
      {
        // Hebrew button
        label: languageDictionary.hebrew,
        type: "radio",
        checked: isLanguage(HEBREW),
        click: () => {
          if (!isLanguage(HEBREW)) {
            loadLanguage(HEBREW);
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
  return languageDictionary.lang === lang;
}
// Start initializations and rendering
app.on("ready", () => {
  initDatabase();
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
  win.webContents.send("languageChange", languageDictionary);
}
// Form submission event listener
ipcMain.on("form-submit", (evt, payload) => {
  dialog // Open save dialog
    .showSaveDialog({
      title: languageDictionary.saveFile,
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
          sendLoadingEvent(evt, false);
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
}

// ---- Loading ----

function sendLoadingEvent(event, loading) {
  event.sender.send("loading", loading);
}

// ---- Database ----

function initDatabase() {
  database = db.dbContent;
}

ipcMain.on("update-database", (evt, payload) => {
  db.updateDb(payload);
});
