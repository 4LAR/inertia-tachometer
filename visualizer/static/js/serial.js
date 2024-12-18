
// const SerialPort = require("serialport").SerialPort;
// const ReadlineParser = require("@serialport/parser-readline").ReadlineParser;
//
// const port = new SerialPort({
//   path: "COM6", // Замените на ваш порт
//   baudRate: 115200,
// });
//
// // Подключаем парсер для чтения данных построчно
// const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));
//
// // Событие при получении данных
// parser.on("data", (line) => {
//   const [accelX, accelY, accelZ, gyroX, gyroY, gyroZ] = line.trim().split(",");
//   calculate({ gyroX, gyroY, gyroZ, accelX, accelY, accelZ });
// });
//
// // ipcMain.on("serial-write", (event, command) => {
// //   if (port && port.isOpen) {
// //     port.write(command + "\n", (err) => {
// //       if (err) {
// //         console.error("Ошибка отправки команды: ", err);
// //       } else {
// //         console.log("Команда отправлена:", command);
// //       }
// //     });
// //   }
// // });
//
// // Обработка ошибок порта
// port.on("error", (err) => {
//   console.error("Ошибка порта: ", err.message);
// });

ipcRenderer.on("mpu-data", (event, data) => {
  calculate(data);
});
