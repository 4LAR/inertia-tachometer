#include <Wire.h>
#include <EEPROM.h>

#define MPU6050_ADDR 0x68
#define PWR_MGMT_1 0x6B
#define ACCEL_XOUT_H 0x3B
#define GYRO_XOUT_H 0x43

// Индексы для хранения значений смещения в EEPROM
#define ACCEL_BIAS_X_ADDR 0
#define ACCEL_BIAS_Y_ADDR 4
#define ACCEL_BIAS_Z_ADDR 8
#define GYRO_BIAS_X_ADDR 12
#define GYRO_BIAS_Y_ADDR 16
#define GYRO_BIAS_Z_ADDR 20

// Переменные для хранения смещения акселерометра и гироскопа
float accelBiasX = 0.0, accelBiasY = 0.0, accelBiasZ = 0.0;
float gyroBiasX = 0.0, gyroBiasY = 0.0, gyroBiasZ = 0.0;
int calibrateCount = 1000; // Количество измерений для калибровки

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

  // Отправляем текущие смещения на компьютер (для проверки)
  Serial.printf("Loaded Accelerometer Bias: %.2f, %.2f, %.2f\n", accelBiasX, accelBiasY, accelBiasZ);
  Serial.printf("Loaded Gyroscope Bias: %.2f, %.2f, %.2f\n", gyroBiasX, gyroBiasY, gyroBiasZ);
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
    } else if (command == "RESET") {
      Serial.println("Resetting calibration...");

      // Сброс значений в EEPROM
      EEPROM.write(ACCEL_BIAS_X_ADDR, 0);
      EEPROM.write(ACCEL_BIAS_Y_ADDR, 0);
      EEPROM.write(ACCEL_BIAS_Z_ADDR, 0);
      EEPROM.write(GYRO_BIAS_X_ADDR, 0);
      EEPROM.write(GYRO_BIAS_Y_ADDR, 0);
      EEPROM.write(GYRO_BIAS_Z_ADDR, 0);

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

  // Печатаем результат калибровки
  Serial.printf("New Accelerometer Bias: %.2f, %.2f, %.2f\n", accelBiasX, accelBiasY, accelBiasZ);
  Serial.printf("New Gyroscope Bias: %.2f, %.2f, %.2f\n", gyroBiasX, gyroBiasY, gyroBiasZ);

  Serial.println("Calibration completed.");
}
