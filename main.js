// ---- Main Process ----
const { app, BrowserWindow, Menu, ipcMain, dialog } = require("electron");
const { dbHandler } = require("./src/dbHandler");
const { ENGLISH, HEBREW } = require("./src/db.model");
const path = require("path");
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
  win.loadFile("index.html");
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
  const appMenu = Menu.buildFromTemplate([
    {
      label: languageDictionary.file,
      submenu: [
        {
          label: languageDictionary.settings,
          click: navigateToSettings,
        },
        {
          type: "separator",
        },
        {
          label: languageDictionary.exit,
          role: isMac ? "close" : "quit",
        },
      ],
    },
    {
      label: languageDictionary.language,
      submenu: [
        {
          label: languageDictionary.english,
          click: () => {
            if (languageDictionary.lang !== ENGLISH) {
              loadLanguage(ENGLISH);
              sendLanguageChange();
            }
          },
        },
        {
          label: languageDictionary.hebrew,
          click: () => {
            if (languageDictionary.lang !== HEBREW) {
              loadLanguage(HEBREW);
              sendLanguageChange();
            }
          },
        },
      ],
    },
  ]);
  Menu.setApplicationMenu(appMenu);
}
// Get database object
function initDatabase() {
  database = db.dbContent;
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
        fs.writeFile(file.filePath.toString(), "Signature", (err) => {
          console.log(err);
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

ipcMain.on("navigate-to-main", () => {
  win.loadFile("index.html");
});

// ---- Navigation ----

function navigateToSettings() {
  win.loadFile("./src/settings.html");
}