#include <Wire.h>
#include <EEPROM.h>

#define MPU6050_ADDR 0x68
#define PWR_MGMT_1 0x6B
#define ACCEL_XOUT_H 0x3B
#define GYRO_XOUT_H 0x43

void setup() {
  Serial.begin(115200);
  Wire.begin(D2, D1);

  // Инициализация MPU6050
  Wire.beginTransmission(MPU6050_ADDR);
  Wire.write(PWR_MGMT_1);
  Wire.write(0); // Выключаем спящий режим
  Wire.endTransmission();
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
  float ax = (accelX / 16384.0);
  float ay = (accelY / 16384.0);
  float az = (accelZ / 16384.0);

  // Преобразуем данные гироскопа в физические величины
  float gx = gyroX / 131.0;
  float gy = gyroY / 131.0;
  float gz = gyroZ / 131.0;

  // Отправляем данные
  Serial.printf("%.2f, %.2f, %.2f, %.2f, %.2f, %.2f\n", ax, ay, az, gx, gy, gz);
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