const { ipcRenderer } = require("electron");
const THREE = require("three");

let gpitch = 0, groll = 0, gyaw = 0; // Начальные значения углов
let apitch = 0, aroll = 0, ayaw = 0; // Начальные значения углов
let lastTime = performance.now(); // Текущее время для расчета dt

// Создаем сцену
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("3dCanvas") });
renderer.setSize(window.innerWidth, window.innerHeight);

// Добавляем куб
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Анимация
function animate() {
    cube.rotation.x = parseFloat(gpitch) * (Math.PI / 180);
    cube.rotation.y = parseFloat(groll) * (Math.PI / 180);
    cube.rotation.z = parseFloat(gyaw) * (Math.PI / 180);
  // cube.rotation.x = THREE.MathUtils.degToRad(apitch); // Переводим градусы в радианы
  // cube.rotation.y = THREE.MathUtils.degToRad(aroll);
  // cube.rotation.z = THREE.MathUtils.degToRad(ayaw);
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
  const dt = (currentTime - lastTime) / 1000.0;
  lastTime = currentTime;

  apitch += averages.accelX * dt;
  aroll += averages.accelY * dt;
  ayaw += averages.accelZ * dt;

  gpitch = Math.atan(data.gyroY / Math.sqrt(data.gyroX ** 2 + data.gyroZ ** 2)) * (180 / Math.PI);
  groll = Math.atan(-data.gyroX / data.gyroZ) * (180 / Math.PI);
  gyaw = 0; // Акселерометр не предоставляет данных для Yaw
});



// ipcRenderer.on("mpu-data", (event, data) => {
//   const { gpitch, groll, gyaw, apitch, aroll, ayaw } = data;
//
//   // Преобразуем углы (Pitch, Roll, Yaw) в радианы
//   cube.rotation.x = parseFloat(gpitch) * (Math.PI / 180);
//   cube.rotation.y = parseFloat(groll) * (Math.PI / 180);
//   cube.rotation.z = parseFloat(gyaw) * (Math.PI / 180);
//
//   // cube.rotation.x = parseFloat(apitch) * (Math.PI / 180);
//   // cube.rotation.y = parseFloat(aroll) * (Math.PI / 180);
//   // cube.rotation.z = parseFloat(ayaw) * (Math.PI / 180);
//
//   document.getElementById('log').innerHTML = `gyro: ${gpitch} / ${groll} / ${gyaw} | axel: ${apitch} / ${aroll} / ${ayaw}`;
// });
