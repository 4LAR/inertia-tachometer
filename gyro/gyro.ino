#include <Wire.h>
#include <EEPROM.h>

#define MPU6050_ADDR 0x68
#define PWR_MGMT_1 0x6B
#define ACCEL_XOUT_H 0x3B
#define GYRO_XOUT_H 0x43

// Индексы для хранения значений смещения и мёртвых зон в EEPROM
#define ACCEL_BIAS_X_ADDR 0
#define ACCEL_BIAS_Y_ADDR 4
#define ACCEL_BIAS_Z_ADDR 8
#define GYRO_BIAS_X_ADDR 12
#define GYRO_BIAS_Y_ADDR 16
#define GYRO_BIAS_Z_ADDR 20
#define ACCEL_DEADZONE_X_ADDR 24
#define ACCEL_DEADZONE_Y_ADDR 28
#define ACCEL_DEADZONE_Z_ADDR 32
#define GYRO_DEADZONE_X_ADDR 36
#define GYRO_DEADZONE_Y_ADDR 40
#define GYRO_DEADZONE_Z_ADDR 44

// Переменные для хранения смещения акселерометра и гироскопа
float accelBiasX = 0.0, accelBiasY = 0.0, accelBiasZ = 0.0;
float gyroBiasX = 0.0, gyroBiasY = 0.0, gyroBiasZ = 0.0;
// Переменные для мёртвых зон
float accelDeadzoneX = 0.0, accelDeadzoneY = 0.0, accelDeadzoneZ = 0.0;
float gyroDeadzoneX = 0.0, gyroDeadzoneY = 0.0, gyroDeadzoneZ = 0.0;
// Количество измерений для калибровки
int calibrateCount = 1000;

void setup() {
  Serial.begin(115200);
  Wire.begin(D2, D1);

  // Инициализация MPU6050
  Wire.beginTransmission(MPU6050_ADDR);
  Wire.write(PWR_MGMT_1);
  Wire.write(0); // Выключаем спящий режим
  Wire.endTransmission();

  // Попытка считать ранее сохраненные смещения акселерометра и гироскопа из EEPROM
  accelBiasX = EEPROM.read(ACCEL_BIAS_X_ADDR) / 100.0;
  accelBiasY = EEPROM.read(ACCEL_BIAS_Y_ADDR) / 100.0;
  accelBiasZ = EEPROM.read(ACCEL_BIAS_Z_ADDR) / 100.0;
  gyroBiasX = EEPROM.read(GYRO_BIAS_X_ADDR) / 100.0;
  gyroBiasY = EEPROM.read(GYRO_BIAS_Y_ADDR) / 100.0;
  gyroBiasZ = EEPROM.read(GYRO_BIAS_Z_ADDR) / 100.0;

  // Загрузка мёртвых зон
  accelDeadzoneX = EEPROM.read(ACCEL_DEADZONE_X_ADDR) / 100.0;
  accelDeadzoneY = EEPROM.read(ACCEL_DEADZONE_Y_ADDR) / 100.0;
  accelDeadzoneZ = EEPROM.read(ACCEL_DEADZONE_Z_ADDR) / 100.0;
  gyroDeadzoneX = EEPROM.read(GYRO_DEADZONE_X_ADDR) / 100.0;
  gyroDeadzoneY = EEPROM.read(GYRO_DEADZONE_Y_ADDR) / 100.0;
  gyroDeadzoneZ = EEPROM.read(GYRO_DEADZONE_Z_ADDR) / 100.0;

  // Отправляем текущие смещения на компьютер (для проверки)
  Serial.printf("Loaded Accelerometer Bias: %.2f, %.2f, %.2f\n", accelBiasX, accelBiasY, accelBiasZ);
  Serial.printf("Loaded Gyroscope Bias: %.2f, %.2f, %.2f\n", gyroBiasX, gyroBiasY, gyroBiasZ);
  Serial.printf("Loaded Accelerometer Deadzones: X: %.2f, Y: %.2f, Z: %.2f\n", accelDeadzoneX, accelDeadzoneY, accelDeadzoneZ);
  Serial.printf("Loaded Gyroscope Deadzones: X: %.2f, Y: %.2f, Z: %.2f\n", gyroDeadzoneX, gyroDeadzoneY, gyroDeadzoneZ);
}

void loop() {
  // Считываем данные акселерометра
  int16_t accelX = readMPU6050(ACCEL_XOUT_H);
  int16_t accelY = readMPU6050(ACCEL_XOUT_H + 2);
  int16_t accelZ = readMPU6050(ACCEL_XOUT_H + 4);

  // Считываем данные гироскопа
  int16_t gyroX = readMPU6050(GYRO_XOUT_H);
  int16_t gyroY = readMPU6050(GYRO_XOUT_H + 2);
  int16_t gyroZ = readMPU6050(GYRO_XOUT_H + 4);

  // Преобразуем данные акселерометра в физические величины
  // float ax = (accelX / 16384.0); // Корректируем с учетом смещения
  // float ay = (accelY / 16384.0);
  // float az = (accelZ / 16384.0);
  float ax = (accelX / 16384.0) - accelBiasX; // Корректируем с учетом смещения
  float ay = (accelY / 16384.0) - accelBiasY;
  float az = (accelZ / 16384.0) - accelBiasZ;

  // Преобразуем данные гироскопа в физические величины
  float gx = gyroX / 131.0 + gyroBiasX;
  float gy = gyroY / 131.0 + gyroBiasY;
  float gz = gyroZ / 131.0 + gyroBiasZ;

  // Применяем мёртвую зону к акселерометру
  if (abs(ax) < accelDeadzoneX) ax = 0;
  if (abs(ay) < accelDeadzoneY) ay = 0;
  if (abs(az) < accelDeadzoneZ) az = 0;

  // Применяем мёртвую зону к гироскопу
  if (abs(gx) < gyroDeadzoneX) gx = 0;
  if (abs(gy) < gyroDeadzoneY) gy = 0;
  if (abs(gz) < gyroDeadzoneZ) gz = 0;

  // Отправляем данные
  Serial.printf("%.2f, %.2f, %.2f, %.2f, %.2f, %.2f\n", ax, ay, az, gx, gy, gz);

  // Ожидаем команду на калибровку
  if (Serial.available()) {
    String command = Serial.readStringUntil('\n');
    if (command == "CALIBRATE") {
      calibrateSensors();
      // После калибровки сохраняем новые значения в EEPROM
      EEPROM.write(ACCEL_BIAS_X_ADDR, accelBiasX * 100);
      EEPROM.write(ACCEL_BIAS_Y_ADDR, accelBiasY * 100);
      EEPROM.write(ACCEL_BIAS_Z_ADDR, accelBiasZ * 100);
      EEPROM.write(GYRO_BIAS_X_ADDR, gyroBiasX * 100);
      EEPROM.write(GYRO_BIAS_Y_ADDR, gyroBiasY * 100);
      EEPROM.write(GYRO_BIAS_Z_ADDR, gyroBiasZ * 100);

      // Сохраняем мёртвую зону в EEPROM
      EEPROM.write(ACCEL_DEADZONE_X_ADDR, accelDeadzoneX * 100);
      EEPROM.write(ACCEL_DEADZONE_Y_ADDR, accelDeadzoneY * 100);
      EEPROM.write(ACCEL_DEADZONE_Z_ADDR, accelDeadzoneZ * 100);
      EEPROM.write(GYRO_DEADZONE_X_ADDR, gyroDeadzoneX * 100);
      EEPROM.write(GYRO_DEADZONE_Y_ADDR, gyroDeadzoneY * 100);
      EEPROM.write(GYRO_DEADZONE_Z_ADDR, gyroDeadzoneZ * 100);
    } else if (command == "RESET") {
      Serial.println("Resetting calibration...");

      // Сброс значений в EEPROM
      EEPROM.write(ACCEL_BIAS_X_ADDR, 0);
      EEPROM.write(ACCEL_BIAS_Y_ADDR, 0);
      EEPROM.write(ACCEL_BIAS_Z_ADDR, 0);
      EEPROM.write(GYRO_BIAS_X_ADDR, 0);
      EEPROM.write(GYRO_BIAS_Y_ADDR, 0);
      EEPROM.write(GYRO_BIAS_Z_ADDR, 0);

      EEPROM.write(ACCEL_DEADZONE_X_ADDR, 0);
      EEPROM.write(ACCEL_DEADZONE_Y_ADDR, 0);
      EEPROM.write(ACCEL_DEADZONE_Z_ADDR, 0);
      EEPROM.write(GYRO_DEADZONE_X_ADDR, 0);
      EEPROM.write(GYRO_DEADZONE_Y_ADDR, 0);
      EEPROM.write(GYRO_DEADZONE_Z_ADDR, 0);

      // Сброс смещений в программе
      accelBiasX = 0.0;
      accelBiasY = 0.0;
      accelBiasZ = 0.0;
      gyroBiasX = 0.0;
      gyroBiasY = 0.0;
      gyroBiasZ = 0.0;

      Serial.println("Calibration reset completed.");
    }
  }
}

// Функция для чтения данных с MPU6050
int16_t readMPU6050(uint8_t reg) {
  Wire.beginTransmission(MPU6050_ADDR);
  Wire.write(reg);
  Wire.endTransmission(false);

  Wire.requestFrom(MPU6050_ADDR, 2);
  int16_t value = Wire.read() << 8 | Wire.read();
  return value;
}

// Функция для калибровки гироскопа и акселерометра
void calibrateSensors() {
  long accelSumX = 0, accelSumY = 0, accelSumZ = 0;
  long gyroSumX = 0, gyroSumY = 0, gyroSumZ = 0;

  float maxAccelX = -1000, minAccelX = 1000;
  float maxAccelY = -1000, minAccelY = 1000;
  float maxAccelZ = -1000, minAccelZ = 1000;
  float maxGyroX = -1000, minGyroX = 1000;
  float maxGyroY = -1000, minGyroY = 1000;
  float maxGyroZ = -1000, minGyroZ = 1000;

  Serial.println("Calibration started...");

  // Собираем данные для калибровки
  for (int i = 0; i < calibrateCount; i++) {
    int16_t accelX = readMPU6050(ACCEL_XOUT_H);
    int16_t accelY = readMPU6050(ACCEL_XOUT_H + 2);
    int16_t accelZ = readMPU6050(ACCEL_XOUT_H + 4);

    int16_t gyroX = readMPU6050(GYRO_XOUT_H);
    int16_t gyroY = readMPU6050(GYRO_XOUT_H + 2);
    int16_t gyroZ = readMPU6050(GYRO_XOUT_H + 4);

    accelSumX += accelX;
    accelSumY += accelY;
    accelSumZ += accelZ;

    gyroSumX += gyroX;
    gyroSumY += gyroY;
    gyroSumZ += gyroZ;

    // Обновляем минимальные и максимальные значения
    maxAccelX = max(maxAccelX, accelX / 16384.0f);
    minAccelX = min(minAccelX, accelX / 16384.0f);
    maxAccelY = max(maxAccelY, accelY / 16384.0f);
    minAccelY = min(minAccelY, accelY / 16384.0f);
    maxAccelZ = max(maxAccelZ, accelZ / 16384.0f);
    minAccelZ = min(minAccelZ, accelZ / 16384.0f);

    maxGyroX = max(maxGyroX, gyroX / 131.0f);
    minGyroX = min(minGyroX, gyroX / 131.0f);
    maxGyroY = max(maxGyroY, gyroY / 131.0f);
    minGyroY = min(minGyroY, gyroY / 131.0f);
    maxGyroZ = max(maxGyroZ, gyroZ / 131.0f);
    minGyroZ = min(minGyroZ, gyroZ / 131.0f);

    delay(10); // Небольшая задержка между измерениями
  }

  // Рассчитываем смещения для гироскопа
  gyroBiasX = (float)gyroSumX / calibrateCount / 131.0;
  gyroBiasY = (float)gyroSumY / calibrateCount / 131.0;
  gyroBiasZ = (float)gyroSumZ / calibrateCount / 131.0;

  // Рассчитываем смещения для акселерометра
  accelBiasX = (float)accelSumX / calibrateCount / 16384.0; // Преобразуем в "g"
  accelBiasY = (float)accelSumY / calibrateCount / 16384.0;
  accelBiasZ = ((float)accelSumZ / calibrateCount / 16384.0) - 1.0; // Учитываем 1g

  // Вычисляем мёртвую зону для каждой оси
  accelDeadzoneX = (maxAccelX - minAccelX) / 2.0;
  accelDeadzoneY = (maxAccelY - minAccelY) / 2.0;
  accelDeadzoneZ = (maxAccelZ - minAccelZ) / 2.0;

  gyroDeadzoneX = (maxGyroX - minGyroX) / 2.0;
  gyroDeadzoneY = (maxGyroY - minGyroY) / 2.0;
  gyroDeadzoneZ = (maxGyroZ - minGyroZ) / 2.0;

  // Печатаем результат калибровки
  Serial.printf("New Accelerometer Bias: %.2f, %.2f, %.2f\n", accelBiasX, accelBiasY, accelBiasZ);
  Serial.printf("New Gyroscope Bias: %.2f, %.2f, %.2f\n", gyroBiasX, gyroBiasY, gyroBiasZ);
  Serial.printf("New Accelerometer Deadzones: X: %.2f, Y: %.2f, Z: %.2f\n", accelDeadzoneX, accelDeadzoneY, accelDeadzoneZ);
  Serial.printf("New Gyroscope Deadzones: X: %.2f, Y: %.2f, Z: %.2f\n", gyroDeadzoneX, gyroDeadzoneY, gyroDeadzoneZ);

  Serial.println("Calibration completed.");
}
