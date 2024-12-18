
var deadZoneGyroX = store.get('deadZoneGyroX', [0, 0]);
var deadZoneGyroY = store.get('deadZoneGyroY', [0, 0]);
var deadZoneGyroZ = store.get('deadZoneGyroZ', [0, 0]);
var deadZoneAccelX = store.get('deadZoneAccelX', [0, 0]);
var deadZoneAccelY = store.get('deadZoneAccelY', [0, 0]);
var deadZoneAccelZ = store.get('deadZoneAccelZ', [0, 0]);
var dead_zone_calibrate_flag = false;

function find_dead_zone(data) {
  deadZoneGyroX = [Math.min(...data.map(d => d.gyroX)), Math.max(...data.map(d => d.gyroX))];
  deadZoneGyroY = [Math.min(...data.map(d => d.gyroY)), Math.max(...data.map(d => d.gyroY))];
  deadZoneGyroZ = [Math.min(...data.map(d => d.gyroZ)), Math.max(...data.map(d => d.gyroZ))];

  deadZoneAccelX = [Math.min(...data.map(d => d.accelX)), Math.max(...data.map(d => d.accelX))];
  deadZoneAccelY = [Math.min(...data.map(d => d.accelY)), Math.max(...data.map(d => d.accelY))];
  deadZoneAccelZ = [Math.min(...data.map(d => d.accelZ)), Math.max(...data.map(d => d.accelZ))];

  console.log("Dead Zones:", {
    deadZoneGyroX,
    deadZoneGyroY,
    deadZoneGyroZ,
    deadZoneAccelX,
    deadZoneAccelY,
    deadZoneAccelZ
  });
  store.set('deadZoneGyroX', deadZoneGyroX);
  store.set('deadZoneGyroY', deadZoneGyroY);
  store.set('deadZoneGyroZ', deadZoneGyroZ);
  store.set('deadZoneAccelX', deadZoneAccelX);
  store.set('deadZoneAccelY', deadZoneAccelY);
  store.set('deadZoneAccelZ', deadZoneAccelZ);
  displayDeadZones();
  dead_zone_calibrate_flag = false;
}

function start_dead_zone() {
  collecting = true;
  dead_zone_calibrate_flag = true;
}

function clear_dead_zone() {
  deadZoneGyroX = [0, 0];
  deadZoneGyroY = [0, 0];
  deadZoneGyroZ = [0, 0];
  deadZoneAccelX = [0, 0];
  deadZoneAccelY = [0, 0];
  deadZoneAccelZ = [0, 0];
  store.set('deadZoneGyroX', deadZoneGyroX);
  store.set('deadZoneGyroY', deadZoneGyroY);
  store.set('deadZoneGyroZ', deadZoneGyroZ);
  store.set('deadZoneAccelX', deadZoneAccelX);
  store.set('deadZoneAccelY', deadZoneAccelY);
  store.set('deadZoneAccelZ', deadZoneAccelZ);
  displayDeadZones();
}

function displayDeadZones() {
  const deadZoneTable = document.getElementById('deadZoneTable');
  deadZoneTable.innerHTML = `
    <table border="1">
      <tr>
        <th>Sensor</th>
        <th>Min</th>
        <th>Max</th>
      </tr>
      <tr>
        <td>Gyro X</td>
        <td>${deadZoneGyroX[0]}</td>
        <td>${deadZoneGyroX[1]}</td>
      </tr>
      <tr>
        <td>Gyro Y</td>
        <td>${deadZoneGyroY[0]}</td>
        <td>${deadZoneGyroY[1]}</td>
      </tr>
      <tr>
        <td>Gyro Z</td>
        <td>${deadZoneGyroZ[0]}</td>
        <td>${deadZoneGyroZ[1]}</td>
      </tr>
      <tr>
        <td>Accel X</td>
        <td>${deadZoneAccelX[0]}</td>
        <td>${deadZoneAccelX[1]}</td>
      </tr>
      <tr>
        <td>Accel Y</td>
        <td>${deadZoneAccelY[0]}</td>
        <td>${deadZoneAccelY[1]}</td>
      </tr>
      <tr>
        <td>Accel Z</td>
        <td>${deadZoneAccelZ[0]}</td>
        <td>${deadZoneAccelZ[1]}</td>
      </tr>
    </table>
  `;
}
displayDeadZones();
