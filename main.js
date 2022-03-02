const { app, BrowserWindow, Menu, ipcMain, dialog } = require("electron");
const { dbHandler } = require("./dbHandler");
const { ENGLISH, HEBREW } = require("./db.model");
const fs = require("fs");

const db = new dbHandler();

let win;
let languageDictionary;
let database;

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

function initLanguage() {
  loadLanguage(database.preferredLang || app.getLocale());
}

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

function saveLanguage(lang) {
  database.preferredLang = lang;
  db.updateDb(database);
}

function createMenu() {
  const appMenu = Menu.buildFromTemplate([
    {
      label: languageDictionary.file,
      submenu: [
        {
          label: languageDictionary.exit,
          click: () => app.quit(),
        },
      ],
    },
    {
      label: languageDictionary.language,
      submenu: [
        {
          label: languageDictionary.english,
          click: () => {
            loadLanguage(ENGLISH);
            sendLanguageChange();
          },
        },
        {
          label: languageDictionary.hebrew,
          click: () => {
            loadLanguage(HEBREW);
            sendLanguageChange();
          },
        },
      ],
    },
  ]);
  Menu.setApplicationMenu(appMenu);
}

function initDatabase() {
  database = db.dbContent;
}

app.on("ready", () => {
  initDatabase();
  initLanguage();
  createWindow();
  createMenu();
  win.webContents.on("dom-ready", sendLanguageChange);
});

function sendLanguageChange() {
  win.webContents.send("languageChange", languageDictionary);
}

// ---- MAC Support ----

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (win === null) {
    createWindow();
  }
});

// ---- IPC Handling ----

ipcMain.on("form-submit", (evt, message) => {
  dialog
    .showSaveDialog({
      title: languageDictionary.saveFile,
      filters: [
        {
          name: "HTML Files",
          extensions: ["html"],
        },
      ],
    })
    .then((file) => {
      console.log(file.filePath.toString());
      if (!file.canceled) {
        fs.writeFile(file.filePath.toString(), "File", (err) => {
          console.log(err);
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
});
