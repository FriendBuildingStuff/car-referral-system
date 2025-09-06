const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      nodeIntegration: false, // keep this false for security
      contextIsolation: true,
    },
  });

  // For development: load Next.js dev server
  if (process.env.NODE_ENV === "development") {
    win.loadURL("http://localhost:3000/");
  } else {
    // For production: load the built Next.js app
    win.loadFile(path.join(__dirname, "out/index.html")); 
    // or use `next start` + loadURL if not exporting static
  }
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
