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
  const [accelX, accelY, accelZ, gyroX, gyroY, gyroZ] = line.trim().split(",");
  if (mainWindow) {
    mainWindow.webContents.send("mpu-data", { gyroX, gyroY, gyroZ, accelX, accelY, accelZ });
  } else {
    console.error("Ошибка: mainWindow не определено.");
  }
});

ipcMain.on("serial-write", (event, command) => {
  if (port && port.isOpen) {
    port.write(command + "\n", (err) => {
      if (err) {
        console.error("Ошибка отправки команды: ", err);
      } else {
        console.log("Команда отправлена:", command);
      }
    });
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
