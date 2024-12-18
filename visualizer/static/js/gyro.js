

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

let measurements = [];
let measurementCount = 0;
let maxMeasurements = 1000;
let collecting = false;
function calculate(data) {
  if (collecting) {
    measurements.push(data);
    measurementCount++;

    if (measurementCount >= maxMeasurements) {
      collecting = false;
      if (dead_zone_calibrate_flag) find_dead_zone(measurements);
      measurementCount = 0; // Сбросить счётчик после калибровки
      measurements = []; // Очистить массив измерений
    }
    return; // Прекратить выполнение, если собираем данные
  }

  // Проверка мёртвой зоны для гироскопа
  if (data.gyroX > deadZoneGyroX[0] && data.gyroX < deadZoneGyroX[1]) {
    data.gyroX = 0;
  }
  if (data.gyroY > deadZoneGyroY[0] && data.gyroY < deadZoneGyroY[1]) {
    data.gyroY = 0;
  }
  if (data.gyroZ > deadZoneGyroZ[0] && data.gyroZ < deadZoneGyroZ[1]) {
    data.gyroZ = 0;
  }

  // Проверка мёртвой зоны для гироскопа
  if (data.accelX > deadZoneAccelX[0] && data.accelX < deadZoneAccelX[1]) {
    data.accelX = 0;
  }
  if (data.accelY > deadZoneAccelY[0] && data.accelY < deadZoneAccelY[1]) {
    data.accelY = 0;
  }
  if (data.accelZ > deadZoneAccelZ[0] && data.accelZ < deadZoneAccelZ[1]) {
    data.accelZ = 0;
  }

  document.getElementById('gyro').innerHTML = `Gyro: ${data.gyroX} / ${data.gyroY} / ${data.gyroZ}`;
  document.getElementById('accel').innerHTML = `Accel: ${data.accelX} / ${data.accelY} / ${data.accelZ}`;

  const currentTimestamp = performance.now();
  const time = currentTimestamp / 1000;
  update_chart(data);

  const deltaTime = (currentTimestamp - lastTimestamp) / 1000;
  lastTimestamp = currentTimestamp;

  rotation.pitch += data.gyroX * deltaTime * gyroSensitivity;
  rotation.roll += data.gyroY * deltaTime * gyroSensitivity;
  rotation.yaw += data.gyroZ * deltaTime * gyroSensitivity;

  velocity.x += data.accelX * accelerationScale * deltaTime;
  velocity.y += data.accelY * accelerationScale * deltaTime;
  velocity.z += data.accelZ * accelerationScale * deltaTime;

  position.x += velocity.x * deltaTime;
  position.y += velocity.y * deltaTime;
  position.z += velocity.z * deltaTime;

  // console.log("Rotation:", rotation);
  // console.log("Position:", position);
}
