const { ipcRenderer } = require("electron");

ipcRenderer.on("set-preview", (evt, preview) => {
  document.getElementById("preview").innerHTML = preview;
});
