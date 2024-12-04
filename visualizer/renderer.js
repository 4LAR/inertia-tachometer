const { ipcRenderer } = require("electron");
const THREE = require("three");

const gyroSensitivity = 131.0 - 130.0;
var raw = true;

// Параметры фильтра Калмана для pitch и roll
const pitchFilter = new KalmanFilter(0.1, 1.0, 1.0, 0); // Шум процесса, шум измерений, начальная ошибка
const rollFilter = new KalmanFilter(0.1, 1.0, 1.0, 0);
const yawFilter = new KalmanFilter(0.1, 1.0, 1.0, 0); // Для yaw можно использовать также фильтр Калмана

let gpitch = 0, groll = 0, gyaw = 0; // Начальные значения углов
let apitch = 0, aroll = 0, ayaw = 0; // Начальные значения углов
let lastTime = performance.now(); // Текущее время для расчета dt

document.getElementById("resetButton").addEventListener("click", () => {
  apitch = 0;
  aroll = 0;
  ayaw = 0;
  gyaw = 0;
});

document.getElementById("calibrateButton").addEventListener("click", () => {
  ipcRenderer.send("serial-write", "CALIBRATE");
});

document.getElementById("hardresetButton").addEventListener("click", () => {
  ipcRenderer.send("serial-write", "RESET"); // Команда для сброса настроек
});

// Создаем сцену
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("3dCanvas") });
renderer.setSize(window.innerWidth, window.innerHeight - 150);

// Добавляем куб
const geometry = new THREE.BoxGeometry(1, 1, 2);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

function normalizeAngle(angle) {
  return ((angle % 360) + 360) % 360; // Приводит к диапазону [0, 360]
}

// Анимация
function animate() {
  cube.rotation.x = THREE.MathUtils.degToRad(normalizeAngle(-aroll));
  cube.rotation.y = THREE.MathUtils.degToRad(normalizeAngle(gyaw));
  cube.rotation.z = THREE.MathUtils.degToRad(normalizeAngle(-apitch));
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

function average(arr) {
  const middle_id = Math.floor(arr.length / 2);
  arr.sort();
  return arr[middle_id];
}

// Обработка данных MPU6050
const max_length_arr = 10;
const dataArrays = {
  gyroX: [],
  gyroY: [],
  gyroZ: [],
  accelX: [],
  accelY: [],
  accelZ: []
};
var averages = {
  gyroX: 0.0,
  gyroY: 0.0,
  gyroZ: 0.0,
  accelX: 0.0,
  accelY: 0.0,
  accelZ: 0.0,
};

ipcRenderer.on("mpu-data", (event, data) => {
  for (const key in data) {
    if (dataArrays[key].length < max_length_arr) {
      dataArrays[key].push(data[key]);
    }
  }

  if (dataArrays.gyroX.length === max_length_arr) {
    averages = Object.fromEntries(
      Object.entries(dataArrays).map(([key, arr]) => [key, average(arr)])
    );

    for (const key in dataArrays) dataArrays[key] = [];
  }

  document.getElementById('log2').innerHTML = `
    FILTERED gyro: ${averages.gyroX} / ${averages.gyroY} / ${averages.gyroZ} |
    accel: ${averages.accelX} / ${averages.accelY} / ${averages.accelZ}
  `;

  document.getElementById('log').innerHTML = `
    RAW DATA gyro: ${data.gyroX} / ${data.gyroY} / ${data.gyroZ} |
    accel: ${data.accelX} / ${data.accelY} / ${data.accelZ}
  `;

  var selected_data = undefined;
  if (raw) {
    selected_data = data;
  } else {
    selected_data = averages;
  }

  const currentTime = performance.now();
  // const dt = Math.min((currentTime - lastTime) / 1000.0, 0.1);
  const dt = (currentTime - lastTime) / 1000.0;
  // const dt = 0.01;

  lastTime = currentTime;

  // Интеграция данных гироскопа
  apitch += selected_data.gyroX / gyroSensitivity * dt;
  aroll += selected_data.gyroY / gyroSensitivity * dt;
  gyaw += selected_data.gyroZ / gyroSensitivity * dt;

  // Рассчитываем углы акселерометра
  const accelPitch = Math.atan2(selected_data.accelY, Math.sqrt(selected_data.accelX ** 2 + selected_data.accelZ ** 2)) * (180 / Math.PI);
  const accelRoll = Math.atan2(-selected_data.accelX, selected_data.accelZ) * (180 / Math.PI);

  // Комплементарный фильтр для корректировки углов
  const alpha = 0.98;
  apitch = alpha * apitch + (1 - alpha) * accelPitch;
  aroll = alpha * aroll + (1 - alpha) * accelRoll;

  // apitch = pitchFilter.update(accelPitch);
  // aroll = rollFilter.update(accelRoll);
  // gyaw = yawFilter.update(gyaw);
  // gyaw = yawFilter.update(gyaw);

  // Проверка и вывод
  // console.log(`apitch: ${apitch}, aroll: ${aroll}, gyaw: ${gyaw}`);
});
