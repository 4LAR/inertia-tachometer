

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
      if (save_data_process_flag) save_data_process(measurements);
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

  if (useKalmanFilter) {
    data.gyroX = kalmanFilterGyroX.update(data.gyroX);
    data.gyroY = kalmanFilterGyroY.update(data.gyroY);
    data.gyroZ = kalmanFilterGyroZ.update(data.gyroZ);
    data.accelX = kalmanFilterAccelX.update(data.accelX);
    data.accelY = kalmanFilterAccelY.update(data.accelY);
    data.accelZ = kalmanFilterAccelZ.update(data.accelZ);
  }

  if (lowPassFilter_flag) {
    data.gyroX = lowPassFilter(data.gyroX, previousGyroX, 0.1);
    data.gyroY = lowPassFilter(data.gyroY, previousGyroY, 0.1);
    data.gyroZ = lowPassFilter(data.gyroZ, previousGyroZ, 0.1);
    data.accelX = lowPassFilter(data.accelX, previousAccelX, 0.1);
    data.accelY = lowPassFilter(data.accelY, previousAccelY, 0.1);
    data.accelZ = lowPassFilter(data.accelZ, previousAccelZ, 0.1);

    previousAccelX = data.accelX;
    previousAccelY = data.accelY;
    previousAccelZ = data.accelZ;
    previousGyroX = data.gyroX;
    previousGyroY = data.gyroY;
    previousGyroZ = data.gyroZ;
  }

  if (useMovingAverageFilter) {
    data.gyroX = gyroFilterX.update(data.gyroX);
    console.log(gyroFilterX.update(data.gyroX));
    data.gyroY = gyroFilterY.update(data.gyroY);
    data.gyroZ = gyroFilterZ.update(data.gyroZ);
    data.accelX = accelFilterX.update(data.accelX);
    data.accelY = accelFilterY.update(data.accelY);
    data.accelZ = accelFilterZ.update(data.accelZ);
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
