import { app, BrowserWindow } from "electron";
import path from "node:path";

const isDev = process.env.NODE_ENV !== "production";

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    transparent: true,
    autoHideMenuBar: true,
    backgroundColor: "#00000000",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (isDev) {
    win.loadURL("http://localhost:5173");
  } else {
    const indexPath = path.join(__dirname, "..", "dist", "index.html");
    win.loadFile(indexPath);
  }
}

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  app.quit();
});
