const Store = require('electron-store');
const store = new Store();

/*----------------------------------------------------------------------------*/

const { ipcRenderer } = require("electron");
const THREE = require("three");

let rotation = { roll: 0, pitch: 0, yaw: 0 }; // Начальная ориентация
let position = { x: 0, y: 0, z: 0 };  // Текущее положение куба
let velocity = { x: 0, y: 0, z: 0 };  // Текущая скорость куба
const alpha = 0.98;                           // Коэффициент комплементарного фильтра
const gyroSensitivity = 1;                 // Масштабный коэффициент гироскопа
const accelerationScale = 9.81;
let lastTimestamp = performance.now();        // Время предыдущего кадра
let useAccelerometer = false;                  // Флаг: true — использовать акселерометр, false — только гироскоп

function clear_pos() {
  rotation = { roll: 0, pitch: 0, yaw: 0 };
  position = { x: 0, y: 0, z: 0 };
  velocity = { x: 0, y: 0, z: 0 };
}

/*----------------------------------------------------------------------------*/

const menu_items = [
  "scene",
  "chart"
];

function open_menu(item) {
  for (const el of menu_items) {
    if (item == el) {
      document.getElementById(el).style.display = "block";
    } else {
      document.getElementById(el).style.display = "none";
    }
  }
}
