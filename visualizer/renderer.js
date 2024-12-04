const { ipcRenderer } = require("electron");
const THREE = require("three");

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

// Создаем сцену
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 800);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("3dCanvas") });
renderer.setSize(window.innerWidth, window.innerHeight);

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
    gyro: ${averages.gyroX} / ${averages.gyroY} / ${averages.gyroZ} |
    accel: ${averages.accelX} / ${averages.accelY} / ${averages.accelZ}
  `;

  document.getElementById('log').innerHTML = `
    gyro: ${data.gyroX} / ${data.gyroY} / ${data.gyroZ} |
    accel: ${data.accelX} / ${data.accelY} / ${data.accelZ}
  `;

  const currentTime = performance.now();
  const dt = Math.min((currentTime - lastTime) / 1000.0, 0.1);
  lastTime = currentTime;

  // Интеграция данных гироскопа
  apitch += averages.gyroX * dt;
  aroll += averages.gyroY * dt;
  gyaw += averages.gyroZ * dt;

  // Рассчитываем углы акселерометра
  const accelPitch = Math.atan2(averages.accelY, Math.sqrt(averages.accelX ** 2 + averages.accelZ ** 2)) * (180 / Math.PI);
  const accelRoll = Math.atan2(-averages.accelX, averages.accelZ) * (180 / Math.PI);

  // Комплементарный фильтр для корректировки углов
  const alpha = 0.98;
  apitch = alpha * apitch + (1 - alpha) * accelPitch;
  aroll = alpha * aroll + (1 - alpha) * accelRoll;

  // Проверка и вывод
  // console.log(`apitch: ${apitch}, aroll: ${aroll}, gyaw: ${gyaw}`);
});
