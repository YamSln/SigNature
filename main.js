const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const Menu = electron.Menu;
const ipc = electron.ipcMain;
const dbManager = require("./dbHandler").dbHandler;

const ENGLISH = "en";
const HEBREW = "he";
const dbHandler = new dbManager();

let win;
let languageDictionary;
let database;

function createWindow() {
  win = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
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
  dbHandler.updateDb(database);
}

function createMenu() {
  const appMenu = Menu.buildFromTemplate([
    {
      label: languageDictionary.file,
      submenu: [
        {
          label: languageDictionary.exit,
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
  database = dbHandler.dbContent;
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
