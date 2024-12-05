

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

  const selectedData = raw ? data : averages;

  /*--------------------------------------------------------------------------*/

  const currentTimestamp = performance.now();
  const deltaTime = (currentTimestamp - lastTimestamp) / 1000;
  lastTimestamp = currentTimestamp;

  rotation.pitch += selectedData.gyroX * deltaTime * gyroSensitivity;
  rotation.roll += selectedData.gyroY * deltaTime * gyroSensitivity;
  rotation.yaw += selectedData.gyroZ * deltaTime * gyroSensitivity;

  velocity.x += selectedData.accelX * accelerationScale * deltaTime;
  velocity.y += selectedData.accelY * accelerationScale * deltaTime;
  velocity.z += selectedData.accelZ * accelerationScale * deltaTime;

  position.x += velocity.x * deltaTime;
  position.y += velocity.y * deltaTime;
  position.z += velocity.z * deltaTime;

  console.log("Rotation:", rotation);
  console.log("Position:", position);

  console.log(rotation);
});
