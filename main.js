const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const Menu = electron.Menu;
const ipc = electron.ipcMain;

const ENGLISH = "en";
const HEBREW = "he";

let win;
let languageDictionary;

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
  loadLanguage(app.getLocale());
}

function loadLanguage(lang) {
  if (lang.includes(HEBREW)) {
    languageDictionary = require("./lang/he.json");
    createMenu();
  } else {
    languageDictionary = require("./lang/en.json");
    createMenu();
  }
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

app.on("ready", () => {
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
