int16_t AcX, AcY, AcZ, GyX, GyY, GyZ;

float velocityX = 0.0;
float velocityY = 0.0;
float positionX = 0.0;
float positionY = 0.0;

float biasX = 0.0;
float biasY = 0.0;
const int numReadings = 100; // Количество измерений для усреднения

float angleX = 0.0; // Угол по оси X
float angleY = 0.0; // Угол по оси Y
const float dt = 0.1; // Время между измерениями (100 мс)

// void mpu_calibrate() {
//   float sumX = 0.0;
//   float sumY = 0.0;

//   for (int i = 0; i < numReadings; i++) {
//     mpu_read(); // Чтение данных
//     sumX += AcX;
//     sumY += AcY;
//     delay(10); // Небольшая задержка между измерениями
//   }
  
//   biasX = sumX / numReadings; // Вычисляем среднее значение для AcX
//   biasY = sumY / numReadings; // Вычисляем среднее значение для AcY
// }

// void mpu_read() {
//   Wire.beginTransmission(MPU_addr);
//   Wire.write(0x3B); // Начинаем с регистра 0x3B (ACCEL_XOUT_H)
//   Wire.endTransmission(false);
//   Wire.requestFrom(MPU_addr, 14, true); // Запрашиваем 14 регистров
//   AcX = Wire.read() << 8 | Wire.read(); // 0x3B (ACCEL_XOUT_H) & 0x3C (ACCEL_XOUT_L)
//   AcY = Wire.read() << 8 | Wire.read(); // 0x3D (ACCEL_YOUT_H) & 0x3E (ACCEL_YOUT_L)
//   AcZ = Wire.read() << 8 | Wire.read(); // 0x3F (ACCEL_ZOUT_H) & 0x40 (ACCEL_ZOUT_L)
//   GyX = Wire.read() << 8 | Wire.read(); // 0x43 (GYRO_XOUT_H) & 0x44 (GYRO_XOUT_L)
//   GyY = Wire.read() << 8 | Wire.read(); // 0x45 (GYRO_YOUT_H) & 0x46 (GYRO_YOUT_L)
//   GyZ = Wire.read() << 8 | Wire.read(); // 0x47 (GYRO_ZOUT_H) & 0x48 (GYRO_ZOUT_L)

//   // Учитываем смещение
//   float ax = (AcX - biasX) / 16384.0; // Convert to g
//   float ay = (AcY - biasY) / 16384.0;

//   // Интеграция угловой скорости для получения углов
//   angleX += GyX * dt / 131.0; // Преобразование в градусы (если GyX в градусах/с)
//   angleY += GyY * dt / 131.0;

//   // Применение углов для корректировки скорости
//   float adjustedAx = ax * cos(angleY * PI / 180.0) - ay * sin(angleY * PI / 180.0);
//   float adjustedAy = ax * sin(angleY * PI / 180.0) + ay * cos(angleY * PI / 180.0);

//   velocityX += adjustedAx * dt;
//   velocityY += adjustedAy * dt;

//   positionX += velocityX * dt;
//   positionY += velocityY * dt;

//   // Вывод значений в Serial Monitor
//   Serial.print("Accelerometer Values: \n");
//   Serial.print("AcX: "); Serial.print(AcX); Serial.print("\nAcY: "); Serial.print(AcY); Serial.print("\nAcZ: "); Serial.print(AcZ);
//   Serial.print("\nGyroscope Values: \n");
//   Serial.print("GyX: "); Serial.print(GyX); 
//   Serial.print("\nGyY: "); Serial.print(GyY); 
//   Serial.print("\nGyZ: "); Serial.print(GyZ);
  
//   Serial.print("\nVelocityX: "); Serial.print(velocityX);
//   Serial.print("\nVelocityY: "); Serial.print(velocityY);
//   Serial.print("\nPositionX: "); Serial.print(positionX);
//   Serial.print("\nPositionY: "); Serial.print(positionY);
//   Serial.print("\n");
//   // delay(500); // Задержка перед следующим чтением
// }

void checkSettings()
{
  Serial.println();
  
  Serial.print(" * Sleep Mode:        ");
  Serial.println(mpu.getSleepEnabled() ? "Enabled" : "Disabled");
  
  Serial.print(" * Clock Source:      ");
  switch(mpu.getClockSource())
  {
    case MPU6050_CLOCK_KEEP_RESET:     Serial.println("Stops the clock and keeps the timing generator in reset"); break;
    case MPU6050_CLOCK_EXTERNAL_19MHZ: Serial.println("PLL with external 19.2MHz reference"); break;
    case MPU6050_CLOCK_EXTERNAL_32KHZ: Serial.println("PLL with external 32.768kHz reference"); break;
    case MPU6050_CLOCK_PLL_ZGYRO:      Serial.println("PLL with Z axis gyroscope reference"); break;
    case MPU6050_CLOCK_PLL_YGYRO:      Serial.println("PLL with Y axis gyroscope reference"); break;
    case MPU6050_CLOCK_PLL_XGYRO:      Serial.println("PLL with X axis gyroscope reference"); break;
    case MPU6050_CLOCK_INTERNAL_8MHZ:  Serial.println("Internal 8MHz oscillator"); break;
  }
  
  Serial.print(" * Gyroscope:         ");
  switch(mpu.getScale())
  {
    case MPU6050_SCALE_2000DPS:        Serial.println("2000 dps"); break;
    case MPU6050_SCALE_1000DPS:        Serial.println("1000 dps"); break;
    case MPU6050_SCALE_500DPS:         Serial.println("500 dps"); break;
    case MPU6050_SCALE_250DPS:         Serial.println("250 dps"); break;
  } 
  
  Serial.print(" * Gyroscope offsets: ");
  Serial.print(mpu.getGyroOffsetX());
  Serial.print(" / ");
  Serial.print(mpu.getGyroOffsetY());
  Serial.print(" / ");
  Serial.println(mpu.getGyroOffsetZ());
  
  Serial.println();
}

void mpu_read() {
  Vector rawGyro = mpu.readRawGyro();
  Vector rawAccel = mpu.readRawAccel();

  // Serial.print(" Xraw = ");
  // Serial.print(rawGyro.XAxis);
  // Serial.print(" Yraw = ");
  // Serial.print(rawGyro.YAxis);
  // Serial.print(" Zraw = ");
  // Serial.println(rawGyro.ZAxis);

  Serial.print(" AXraw = ");
  Serial.print(rawAccel.XAxis);
  Serial.print(" AYraw = ");
  Serial.print(rawAccel.YAxis);
  Serial.print(" AZraw = ");
  Serial.println(rawAccel.ZAxis);
  
  delay(10);
}

void mpu_get() {
  mpu_read();
  String jsonResponse = "{";
  jsonResponse += "\"velocityX\":" + String(velocityX) + ",";
  jsonResponse += "\"velocityY\":" + String(velocityY) + ",";
  jsonResponse += "\"positionX\":" + String(positionX) + ",";
  jsonResponse += "\"positionY\":" + String(positionY) + ",";

  jsonResponse += "\"AcX\":" + String(AcX) + ",";
  jsonResponse += "\"AcY\":" + String(AcY) + ",";
  jsonResponse += "\"AcZ\":" + String(AcZ) + ",";
  jsonResponse += "\"GyX\":" + String(GyX) + ",";
  jsonResponse += "\"GyY\":" + String(GyY) + ",";
  jsonResponse += "\"GyZ\":" + String(GyZ);
  jsonResponse += "}";
  

  // Send JSON response
  server.send(200, "application/json", jsonResponse);
}