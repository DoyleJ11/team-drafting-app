// main.js

const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // Enable Node.js integration
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.loadFile("dist/index.html");
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  // On macOS, apps stay active until the user quits explicitly
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  // Re-create a window when the app is activated (macOS)
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
