const { ipcRenderer } = require("electron");
const THREE = require("three");

let rotation = { roll: 0, pitch: 0, yaw: 0 }; // Начальная ориентация
const position = { x: 0, y: 0, z: 0 };  // Текущее положение куба
const velocity = { x: 0, y: 0, z: 0 };  // Текущая скорость куба
const alpha = 0.98;                           // Коэффициент комплементарного фильтра
const gyroSensitivity = 1;                 // Масштабный коэффициент гироскопа
const accelerationScale = 9.81;
let lastTimestamp = performance.now();        // Время предыдущего кадра
let useAccelerometer = false;                  // Флаг: true — использовать акселерометр, false — только гироскоп
var raw = true;                               //

// Параметры фильтра Калмана для pitch и roll
const pitchFilter = new KalmanFilter(0.1, 1.0, 1.0, 0); // Шум процесса, шум измерений, начальная ошибка
const rollFilter = new KalmanFilter(0.1, 1.0, 1.0, 0);
const yawFilter = new KalmanFilter(0.1, 1.0, 1.0, 0); // Для yaw можно использовать также фильтр Калмана

/*----------------------------------------------------------------------------*/

document.getElementById("resetButton").addEventListener("click", () => {
  rotation = { roll: 0, pitch: 0, yaw: 0 };
});

document.getElementById("calibrateButton").addEventListener("click", () => {
  ipcRenderer.send("serial-write", "CALIBRATE");
});

document.getElementById("hardresetButton").addEventListener("click", () => {
  ipcRenderer.send("serial-write", "RESET"); // Команда для сброса настроек
});
