const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const SerialPort = require("serialport").SerialPort;
const ReadlineParser = require("@serialport/parser-readline").ReadlineParser;


let mainWindow;

app.on("ready", () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
    },
  });
  mainWindow.loadFile("index.html");
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});


const port = new SerialPort({
  path: "COM6", // Замените на ваш порт
  baudRate: 115200,
});


// Подключаем парсер для чтения данных построчно
const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

// Событие при получении данных
parser.on("data", (line) => {
  const [gyroX, gyroY, gyroZ, accelX, accelY, accelZ] = line.trim().split(",");

  // Проверьте, что mainWindow определено
  if (mainWindow) {
    mainWindow.webContents.send("mpu-data", { gyroX, gyroY, gyroZ, accelX, accelY, accelZ });
  } else {
    console.error("Ошибка: mainWindow не определено.");
  }
});

// Обработка ошибок порта
port.on("error", (err) => {
  console.error("Ошибка порта: ", err.message);
});

module.exports = {
  initialize: (window) => {
    mainWindow = window;
  },
};
